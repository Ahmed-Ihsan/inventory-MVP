# Business logic for items
from ..models.item import Item


def update_item_stock(item: Item, new_stock: int):
    item.current_stock = new_stock
