"""Synthetic ownership regression tests, without importing credentials or libraries."""
import ast
from pathlib import Path
import unittest


source = Path(__file__).resolve().parents[1] / 'tools' / 'sync_worker.py'
tree = ast.parse(source.read_text(encoding='utf-8'))
helper = next(node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name == 'upsert_owned_account')
namespace = {}
exec(compile(ast.Module(body=[helper], type_ignores=[]), str(source), 'exec'), namespace)
upsert_owned_account = namespace['upsert_owned_account']


class Cursor:
    def __init__(self, returned):
        self.returned = returned
        self.query = ''
        self.parameters = ()

    def execute(self, query, parameters):
        self.query = query
        self.parameters = parameters

    def fetchone(self):
        return self.returned


class OwnershipTests(unittest.TestCase):
    def invoke(self, returned):
        cursor = Cursor(returned)
        result = upsert_owned_account(cursor, 'user-a', 'PF', 'item-a', {
            'id': 'external-account', 'name': 'Synthetic account', 'institution': 'Synthetic bank',
        })
        return result, cursor

    def test_same_owner_can_sync(self):
        result, cursor = self.invoke({'id': 'account-a', 'user_id': 'user-a'})
        self.assertEqual(result, 'account-a')
        self.assertIn('WHERE accounts.user_id = EXCLUDED.user_id', cursor.query)
        self.assertIn('accounts.pluggy_item_id = EXCLUDED.pluggy_item_id', cursor.query)
        self.assertEqual(cursor.parameters[0], 'user-a')

    def test_conflicting_external_id_stops_before_transaction_fetch(self):
        with self.assertRaises(PermissionError):
            self.invoke(None)

    def test_returned_account_with_foreign_owner_is_rejected(self):
        with self.assertRaises(PermissionError):
            self.invoke({'id': 'account-b', 'user_id': 'user-b'})


if __name__ == '__main__':
    unittest.main()
