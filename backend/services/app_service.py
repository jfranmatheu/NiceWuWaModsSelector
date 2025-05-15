from pathlib import Path
import appdirs
from typing import Optional

from .utils import FileUtils


default_settings = {
    "mods_dir": str(Path(appdirs.user_data_dir(roaming=True)) / "XXMI Launcher" / "WWMI" / "Mods"),
}


class AppService:
    """ 
    This class is used to manage the app's settings, paths, and data.
    """

    _instance = None

    @staticmethod
    def get():
        if AppService._instance is None:
            AppService._instance = AppService()
        return AppService._instance

    def __init__(self) -> None:
        self.appdata_dir = Path(appdirs.user_data_dir(appname="NiceWuWaModsSelector", appauthor="jfranmatheu"))
        FileUtils.ensure_directory(self.appdata_dir, parents=True)
        self.app_settings_file = self.appdata_dir / "settings.json"
        self.settings = {}
        self.load_settings()

    @property
    def mods_dir(self) -> Path:
        return Path(self.settings["mods_dir"]) / "NiceWuWaModsSelector"

    def verify_mods_dir(self, mods_dir: Optional[Path] = None) -> bool:
        """Verify that the mods directory exists and is a valid directory"""
        if mods_dir is None:
            mods_dir = Path(self.settings["mods_dir"])
        else:
            if isinstance(mods_dir, str):
                mods_dir = Path(mods_dir)
            elif not isinstance(mods_dir, Path):
                raise ValueError("mods_dir must be a Path or a string")

        if mods_dir.exists() and mods_dir.is_dir() and 'Mods' in mods_dir.name:
            return 'WWMI' in mods_dir.parent.name and 'XXMI Launcher' in mods_dir.parent.parent.name
        else:
            return False

    def load_settings(self) -> dict:
        """Load settings from user data directory"""
        if not self.app_settings_file.exists():
            # Create default settings
            global default_settings
            self.settings = default_settings
            if not self.verify_mods_dir():
                # default mod folder is invalid!
                self.settings["mods_dir"] = ''
            else:
                FileUtils.ensure_directory(self.mods_dir, parents=False)
            self.save_settings()
            print("Created default settings file.")
        else:
            self.settings = FileUtils.read_json(self.app_settings_file)
            if not self.verify_mods_dir():
                # user deleted the mods dir?
                self.settings["mods_dir"] = ''
                self.save_settings()
            else:
                FileUtils.ensure_directory(self.mods_dir, parents=False)
            print("Loaded settings from file.")

        print("Loaded Settings: ", self.app_settings_file, self.settings)

    def save_settings(self):
        """Save settings to user data directory"""
        try:
            FileUtils.write_json(self.app_settings_file, self.settings)
        except Exception as e:
            print(f"Error saving settings: {e}")
            raise

    def update_settings(self, settings: dict):
        """Update settings"""
        if "mods_dir" in settings:
            if not self.verify_mods_dir(settings["mods_dir"]):
                # trying to set an invalid dirpath!
                settings["mods_dir"] = ''
            else:
                # Ensure mods dir exists.
                FileUtils.ensure_directory(self.mods_dir, parents=False)
                # Reload mods metadata.
                from .mod_service import ModService
                ModService.get().init()

        self.settings.update(settings)
        self.save_settings()
