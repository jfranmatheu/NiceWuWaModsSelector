# NiceWuWaModsSelector



https://github.com/user-attachments/assets/c0b64ac1-ae5a-4a56-9d57-fd32ffc949b8



A modern, sleek, and user-friendly desktop application for managing mods for the game Wuthering Waves.

## Features

- Drag-and-drop mod installation
- GameBanana integration for direct mod downloads
- Mod categorization and management
- Character-specific mod organization
- Preview images for mods
- Enable/disable mods with a single click
- Modern and responsive UI

## Prerequisites

- Python 3.11 or higher
- Node.js 16 or higher
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/NiceWuWaModsSelector.git
   cd NiceWuWaModsSelector
   ```

2. Set up the backend:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

## Development

1. Start the backend server:
   ```bash
   cd backend
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   python main.py
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Building for Production

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. The built files will be in the `frontend/dist` directory.

## Usage

1. Launch the application
2. Set your mods folder in the settings
3. Add mods by:
   - Dragging and dropping mod files
   - Pasting GameBanana URLs
4. Organize mods by category and character
5. Enable/disable mods as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Wuthering Waves](https://wutheringwaves.kurogame.com/)
- [GameBanana](https://gamebanana.com/)
- [Svelte](https://svelte.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [TailwindCSS](https://tailwindcss.com/) 
