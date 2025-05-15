import httpx

from models import Character, CharacterResponse, GameBananaCategory


character_cache = None


async def fetch_and_cache_characters():
    """Fetch character data and cache it for future use"""
    global character_cache
    try:
        async with httpx.AsyncClient() as client:
            # Fetch character data from prydwen.gg
            response = await client.get('https://www.prydwen.gg/page-data/sq/d/3446734364.json')
            response.raise_for_status()
            data = response.json()

            # Process character data
            characters_data = data['data']['allContentfulWwCharacter']['nodes']
            characters = []

            # Process regular characters
            for char in characters_data:
                if not char['name'].startswith('Rover'):
                    try:
                        # Convert None values to False for boolean fields
                        is_new = bool(char.get('isNew', False))
                        upcoming = bool(char.get('upcoming', False))
                        
                        character = Character(
                            name=char['name'],
                            icon=f"https://www.prydwen.gg{char['smallImage']['localFile']['childImageSharp']['gatsbyImageData']['images']['fallback']['src']}",
                            cardImage=f"https://www.prydwen.gg{char['cardImage']['localFile']['childImageSharp']['gatsbyImageData']['images']['fallback']['src']}",
                            weapon=char['weapon'],
                            element=char['element'],
                            rarity=char['rarity'],
                            unitId=char['unitId'],
                            id=char['id'],
                            isNew=is_new,
                            upcoming=upcoming
                        )
                        characters.append(character)
                    except Exception as e:
                        print(f"Error processing character {char.get('name', 'unknown')}: {str(e)}")
                        continue

            # Add Rover characters
            rover_data = {
                "name": "Rover Female",
                "icon": "https://www.prydwen.gg/static/33d043cdcced39c96b08f210c4c15d4c/60b4d/rover_icon.webp",
                "cardImage": "https://www.prydwen.gg/static/ec3edb26e6df7f128ff8f9d1226c9a76/b26e2/rover_card.webp",
                "weapon": "Sword",
                "element": "All",
                "rarity": "5",
                "unitId": "0",
                "id": "rover-female",
                "isNew": False,
                "upcoming": False
            }
            characters.append(Character(**rover_data))

            rover_data = rover_data.copy()
            rover_data["name"] = "Rover Male"
            rover_data["id"] = "rover-male"
            characters.append(Character(**rover_data))

            # Fix specific character names
            for char in characters:
                if char.name == "The Shorekeeper":
                    char.name = "Shorekeeper"

            # Sort characters by rarity and name
            characters.sort(key=lambda x: (
                x.rarity != "5",  # 5★ first
                x.rarity != "4",  # then 4★
                x.name.lower()    # then alphabetically
            ))

            # Fetch GameBanana categories
            try:
                gb_response = await client.get("https://gamebanana.com/apiv11/Mod/Categories?_idCategoryRow=29524&_sSort=a_to_z&_bShowEmpty=true")
                gb_response.raise_for_status()
                gb_data = gb_response.json()

                # Match GameBanana categories with characters
                for char in characters:
                    for category in gb_data:
                        if category['_sName'] == char.name:
                            char.gamebanana = GameBananaCategory(
                                cat_id=category['_idRow'],
                                cat_url=category['_sUrl'],
                                cat_mod_count=category['_nItemCount']
                            )
                            break
            except Exception as e:
                print(f"Error fetching GameBanana categories: {str(e)}")
                # Continue without GameBanana data rather than failing completely

            character_cache = CharacterResponse(characters=characters)
            print("Character data cached successfully")
            return character_cache

    except Exception as e:
        print(f"Error caching character data: {str(e)}")
        return None


async def get_characters_list():
    global character_cache
    
    if character_cache is None:
        # If cache is empty, try to fetch and cache the data
        character_cache = await fetch_and_cache_characters()
        if character_cache is None:
            raise HTTPException(status_code=500, detail="Failed to fetch character data")
    
    return character_cache
