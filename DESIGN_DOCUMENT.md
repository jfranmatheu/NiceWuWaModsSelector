# NiceWuWaModsSelector Design Document

## Overview

**NiceWuWaModsSelector** is a modern, sleek, and user-friendly desktop application for managing mods for the game Wuthering Waves. Built with Python 3.11 and the NiceGUI framework, the app leverages TailwindCSS for styling (if possible) and provides a single-page application (SPA) experience with dynamic content. The application allows users to easily add, categorize, preview, and remove mods, supporting both drag-and-drop installation and direct downloads from GameBanana.

---

## Goals

- Provide an intuitive, visually appealing mod manager for Wuthering Waves.
- Support drag-and-drop installation of mod archives (zip/7z/rar).
- Enable mod installation directly from GameBanana URLs.
- Allow categorization, preview, and management of mods.
- Ensure easy configuration and robust file management.
- Offer a responsive SPA-like experience with NiceGUI.

---

## Technology Stack

- **Front:** NextJS
- **Backend:** Python 3.11, FastAPI (front will request data to backend via a fastapi server) and PyWebView (desktop app and launcher)
- **Database:** JSON or SQLite (if needed)
- **Styling:** modern and sleek
- **Packaging:** PyInstaller or similar (for desktop distribution)
- **Archive Handling:** `zipfile`, `py7zr`, `rarfile` Python libraries
- **HTTP Requests:** `requests` or `httpx`
- **Image Handling:** `Pillow` or similar

---

## Features

### 1. Mod Management

- **Add Mods:**  
  - Drag-and-drop support for zip/7z/rar files.
  - Popup UI for each dropped file:
    - Mod name (default: filename)
    - Wuthering Waves version selector
    - Mod category selector
    - Character selector (if category is "Characters")
    - Preview image selector (auto-selects 'preview' image if present, else first image found)
- **Remove Mods:**  
  - Remove mod from disk and app list.
- **Search Mods:**  
  - Search bar for filtering mods by name, category, or character.
- **Reload Mods:**  
  - Button to reload mod list from disk.
- **Enable/Disable Mods:**
  - To disable mods, we should just rename the mod folder to add a `DISABLED_` prefix.
  - To enable mods, we should just remove the `DISABLED_` prefix.
  - We can then know if a mod is enabled or disabled by checking if it has the `DISABLED_` prefix.

### 2. Mod Installation from URL

- **GameBanana Integration:**  
  - Paste/click a GameBanana mod URL.
  - Validate URL and fetch metadata (mod type, character, available files).
  - Prompt user to select file to download, display gamebanana fetch metadata for reference.
  - Download, extract, and move to managed folder.

### 3. File & Folder Management

- **Mods Folder Configuration:**  
  - User sets the root 'Mods' folder.
  - App ensures a `NiceWuWaModsSelector` subfolder exists for managed mods.

### 4. UI/UX Design

- **Sidebar:**  
  - Fixed left sidebar with app title.
  - Navigation for categories: Characters, NPCs, Weapons, UI, Other.
  - Settings button at the bottom.
- **Main Content:**  
  - Displays mod grid for selected category.
  - For Characters: left-side character selector, right-side mod grid.
- **Settings:**  
  - App settings (e.g., Mods folder path).
- **Mod Details:**  
  - On hover, show details: WW version, created at, updated at, etc.

---

## Data Model

### Mod Metadata

- `name`: string
- `filename`: string
- `category`: enum (Characters, NPCs, Weapons, UI, Other)
- `character`: string (if applicable)
- `wuwa_version`: string
- `preview_image`: path/url
- `created_at`: datetime
- `updated_at`: datetime
- `source_url`: string (if downloaded)
- `archive_type`: enum (zip, 7z, rar)

### Categories & Icons

| Category    | Icon URL                                                         |
|-------------|------------------------------------------------------------------|
| Characters  | https://images.gamebanana.com/img/ico/ModCategory/6654b6596ba11.png |
| NPCs        | https://images.gamebanana.com/img/ico/ModCategory/66e0d90771ac5.png |
| Weapons     | (Add icon if available)                                          |
| UI          | https://images.gamebanana.com/img/ico/ModCategory/6692c913ddf00.png |
| Other       | https://images.gamebanana.com/img/ico/ModCategory/6692c90cba314.png |

### Character List

A full list of character names and their icons is included in the appendix.

---

## User Flows

### 1. Drag-and-Drop Mod Installation

1. User drags archive(s) onto app.
2. Popup appears for each file:
   - User reviews/edits metadata.
   - Selects WW version, category, character (if needed), preview image.
   - Confirms installation.
3. App extracts archive, saves mod data, updates mod list.

### 2. Install Mod from URL

1. User clicks "Install from URL" and pastes GameBanana link.
2. App validates and fetches mod metadata.
3. User selects file to download (if multiple).
4. App downloads, extracts, and installs mod.

### 3. Mod Management

- User can search, filter, and remove mods.
- Hovering over a mod shows detailed info.

### 4. Settings

- User sets or changes Mods folder.
- App ensures proper folder structure.

---

## UI Wireframe (Textual)

| Sidebar                | Main Content                                      |
|------------------------|--------------------------------------------------|
| App Title              | [Category Title]                                 |
| [Characters]           | [Character Selector] [Mod Grid]                  |
| [NPCs]                 | [Mod Grid]                                       |
| [Weapons]              | [Mod Grid]                                       |
| [UI]                   | [Mod Grid]                                       |
| [Other]                | [Mod Grid]                                       |
|                        |                                                  |
| [Settings Icon]        | [Settings Panel]                                 |

---

## Implementation Notes

- Use NiceGUI's SPA capabilities for smooth navigation.
- TailwindCSS integration may require custom setup with NiceGUI.
- Archive extraction should handle errors gracefully.
- All file operations must be atomic and safe.
- Consider using a JSON file or lightweight database for mod metadata.

---

## Appendix

### Character Names and Icons

| Name           | Icon URL                                                         |
|----------------|------------------------------------------------------------------|
| Alto           | https://images.gamebanana.com/img/ico/ModCategory/6683c4ff33f3b.png |
| Baizhi         | https://images.gamebanana.com/img/ico/ModCategory/6683c39f41dda.png |
| Brant          | https://images.gamebanana.com/img/ico/ModCategory/67c981a895579.png |
| Calcharo       | https://images.gamebanana.com/img/ico/ModCategory/6683c5f44ca4e.png |
| Camellya       | https://images.gamebanana.com/img/ico/ModCategory/675b7f303af84.png |
| Cantarella     | https://images.gamebanana.com/img/ico/ModCategory/6812a36c23457.png |
| Carlotta       | https://images.gamebanana.com/img/ico/ModCategory/6812a3cf60524.png |
| Changli        | https://images.gamebanana.com/img/ico/ModCategory/6683c68095b05.png |
| Chixia         | https://images.gamebanana.com/img/ico/ModCategory/6683c25a55aad.png |
| Danjin         | https://images.gamebanana.com/img/ico/ModCategory/6683c49eef2b5.png |
| Encore         | https://images.gamebanana.com/img/ico/ModCategory/6683c41aafe7c.png |
| Jianxin        | https://images.gamebanana.com/img/ico/ModCategory/6683c6300cb95.png |
| Jinhsi         | https://images.gamebanana.com/img/ico/ModCategory/6683c65ae3201.png |
| Jiyan          | https://images.gamebanana.com/img/ico/ModCategory/6683c4cec9dfe.png |
| Lingyang       | https://images.gamebanana.com/img/ico/ModCategory/6683c56786bfb.png |
| Lumi           | https://images.gamebanana.com/img/ico/ModCategory/675b1120b010b.png |
| Mortefi        | https://images.gamebanana.com/img/ico/ModCategory/6683c52684f89.png |
| Pheobe         | https://images.gamebanana.com/img/ico/ModCategory/6812a40cb85a4.png |
| Roccia         | https://images.gamebanana.com/img/ico/ModCategory/6812a44645b98.png |
| Rover(F)       | https://images.gamebanana.com/img/ico/ModCategory/6683c35cd412e.png |
| Rover(M)       | https://images.gamebanana.com/img/ico/ModCategory/6683c30d33704.png |
| Sanhua         | https://images.gamebanana.com/img/ico/ModCategory/6683c3d32a078.png |
| Shorekeeper    | https://images.gamebanana.com/img/ico/ModCategory/66f8c47b49ee8.png |
| Taoqi          | https://images.gamebanana.com/img/ico/ModCategory/6683c451a74aa.png |
| Verina         | https://images.gamebanana.com/img/ico/ModCategory/6683c2db4c218.png |
| Xiangli Yao    | https://images.gamebanana.com/img/ico/ModCategory/66bddde6d44ed.png |
| Yangyang       | https://images.gamebanana.com/img/ico/ModCategory/6683c230d99e1.png |
| Yinlin         | https://images.gamebanana.com/img/ico/ModCategory/6683c5b7aea39.png |
| Youhu          | https://images.gamebanana.com/img/ico/ModCategory/6812a47de960d.png |
| Yuanwu         | https://images.gamebanana.com/img/ico/ModCategory/6683c591329e5.png |
| Zani           | https://images.gamebanana.com/img/ico/ModCategory/6812a2f8ddacc.png |
| Zhezhi         | https://images.gamebanana.com/img/ico/ModCategory/66bdde0a65151.png |

---

## Future Enhancements

- Create profile system for user-specific settings of enabled mods. And a permanent list of mods that should be enabled by default, no matter the profile (that is, a way to set a mod as permanently enabled, outside the profiles workflow).
- Support for mod versioning and updates.
- User authentication for cloud sync.
- More granular permissions and backup/restore options.
- Integration with other mod repositories.

---

## References

- [NiceGUI Documentation](https://nicegui.io/documentation)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [GameBanana API](https://gamebanana.com/apidocs)
- [Wuthering Waves Official Site](https://wutheringwaves.kurogame.com/)
