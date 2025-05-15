from models import CharacterResponse
from .character_list import get_characters_list

categories = [
    "Characters",
    "Echoes",
    "Gliders",
    "NPCs",
    "Weapons",
    "UI",
    "Other"
]

subcategories = {
    "Characters": []
}

async def mount_character_subcategories():
    global subcategories
    if len(subcategories["Characters"]) > 0:
        return
    character_list = await get_characters_list()
    for character in character_list.characters:
        subcategories["Characters"].append(character.name)


def get_categories():
    global categories
    return categories

def get_character_categories():
    global subcategories
    if len(subcategories["Characters"]) == 0:
        mount_character_subcategories()
    return subcategories["Characters"]
