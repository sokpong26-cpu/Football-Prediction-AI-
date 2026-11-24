import os
import shutil
from pathlib import Path

# Define file type categories and their extensions
FILE_CATEGORIES = {
    "Images": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"],
    "Documents": [".pdf", ".docx", ".doc", ".txt", ".xlsx", ".pptx", ".csv"],
    "Audio": [".mp3", ".wav", ".aac", ".flac", ".ogg"],
    "Videos": [".mp4", ".mkv", ".mov", ".avi", ".wmv"],
    "Archives": [".zip", ".tar", ".gz", ".rar", ".7z"],
    "Code_and_Scripts": [".py", ".js", ".html", ".css", ".json", ".sh", ".cpp"],
}

def organize_folder(target_dir: str):
    target_path = Path(target_dir).expanduser().resolve()

    if not target_path.exists() or not target_path.is_dir():
        print(f"Error: '{target_dir}' is not a valid directory.")
        return

    print(f"Organizing files in: {target_path}\n")

    for item in target_path.iterdir():
        # Skip subdirectories
        if item.is_dir():
            continue

        file_extension = item.suffix.lower()
        moved = False

        # Check which category matches the file extension
        for category, extensions in FILE_CATEGORIES.items():
            if file_extension in extensions:
                dest_folder = target_path / category
                dest_folder.mkdir(exist_ok=True)
                shutil.move(str(item), str(dest_folder / item.name))
                print(f"Moved: {item.name} -> {category}/")
                moved = True
                break

        # Move uncategorized files into 'Other'
        if not moved and file_extension:
            other_folder = target_path / "Other"
            other_folder.mkdir(exist_ok=True)
            shutil.move(str(item), str(other_folder / item.name))
            print(f"Moved: {item.name} -> Other/")

    print("\nOrganization complete!")

if __name__ == "__main__":
    # Change this path to the folder you want to organize
    folder_to_clean = "./downloads_test"
    
    # Example usage:
    # organize_folder(folder_to_clean)
    print("Script ready. Set 'folder_to_clean' and uncomment 'organize_folder(folder_to_clean)' to run.")