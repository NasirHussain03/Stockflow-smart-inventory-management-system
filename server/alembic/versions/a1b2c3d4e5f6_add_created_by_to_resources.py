"""Add created_by to products, customers, orders

Revision ID: a1b2c3d4e5f6
Revises: 377e6145b6af
Create Date: 2026-06-01 21:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '377e6145b6af'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add created_by (nullable so existing rows are not broken)
    op.add_column('products',  sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True))
    op.add_column('customers', sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True))
    op.add_column('orders',    sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True))


def downgrade() -> None:
    op.drop_column('orders',    'created_by')
    op.drop_column('customers', 'created_by')
    op.drop_column('products',  'created_by')
