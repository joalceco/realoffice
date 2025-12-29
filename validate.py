#!/usr/bin/env python3
"""
RealOffice Project Validation Script
Checks project structure, dependencies, and code quality
"""

import os
import sys
import json
from pathlib import Path

def check_file_exists(path, description):
    """Check if a file exists"""
    if os.path.exists(path):
        print(f"✅ {description}")
        return True
    else:
        print(f"❌ {description} - NOT FOUND: {path}")
        return False

def check_directory_exists(path, description):
    """Check if a directory exists"""
    if os.path.isdir(path):
        print(f"✅ {description}")
        return True
    else:
        print(f"❌ {description} - NOT FOUND: {path}")
        return False

def validate_json_file(path, description):
    """Validate JSON file syntax"""
    try:
        with open(path, 'r') as f:
            json.load(f)
        print(f"✅ {description} - Valid JSON")
        return True
    except json.JSONDecodeError as e:
        print(f"❌ {description} - Invalid JSON: {e}")
        return False
    except FileNotFoundError:
        print(f"❌ {description} - NOT FOUND")
        return False

def main():
    print("=" * 60)
    print("RealOffice Project Validation")
    print("=" * 60)
    print()
    
    project_root = Path(__file__).parent
    all_checks_passed = True
    
    # Check root files
    print("📁 Root Files:")
    all_checks_passed &= check_file_exists(project_root / "README.md", "README.md")
    all_checks_passed &= check_file_exists(project_root / "docker-compose.yml", "docker-compose.yml")
    all_checks_passed &= check_file_exists(project_root / ".gitignore", ".gitignore")
    all_checks_passed &= check_file_exists(project_root / "ARCHITECTURE.md", "ARCHITECTURE.md")
    all_checks_passed &= check_file_exists(project_root / "DEVELOPMENT.md", "DEVELOPMENT.md")
    all_checks_passed &= check_file_exists(project_root / "API.md", "API.md")
    print()
    
    # Check backend structure
    print("🐍 Backend Structure:")
    backend_dir = project_root / "backend"
    all_checks_passed &= check_directory_exists(backend_dir, "backend/ directory")
    all_checks_passed &= check_file_exists(backend_dir / "Dockerfile", "Backend Dockerfile")
    all_checks_passed &= check_file_exists(backend_dir / "requirements.txt", "requirements.txt")
    all_checks_passed &= check_file_exists(backend_dir / "app" / "main.py", "main.py")
    all_checks_passed &= check_directory_exists(backend_dir / "app" / "api", "api/ directory")
    all_checks_passed &= check_directory_exists(backend_dir / "app" / "models", "models/ directory")
    all_checks_passed &= check_directory_exists(backend_dir / "app" / "schemas", "schemas/ directory")
    all_checks_passed &= check_directory_exists(backend_dir / "app" / "core", "core/ directory")
    all_checks_passed &= check_directory_exists(backend_dir / "app" / "services", "services/ directory")
    print()
    
    # Check backend API files
    print("🔌 Backend API Endpoints:")
    api_dir = backend_dir / "app" / "api"
    all_checks_passed &= check_file_exists(api_dir / "workspaces.py", "workspaces.py")
    all_checks_passed &= check_file_exists(api_dir / "users.py", "users.py")
    all_checks_passed &= check_file_exists(api_dir / "zones_objects.py", "zones_objects.py")
    all_checks_passed &= check_file_exists(api_dir / "websocket.py", "websocket.py")
    print()
    
    # Check frontend structure
    print("⚛️  Frontend Structure:")
    frontend_dir = project_root / "frontend"
    all_checks_passed &= check_directory_exists(frontend_dir, "frontend/ directory")
    all_checks_passed &= check_file_exists(frontend_dir / "Dockerfile", "Frontend Dockerfile")
    all_checks_passed &= validate_json_file(frontend_dir / "package.json", "package.json")
    all_checks_passed &= validate_json_file(frontend_dir / "tsconfig.json", "tsconfig.json")
    all_checks_passed &= check_file_exists(frontend_dir / "src" / "App.tsx", "App.tsx")
    all_checks_passed &= check_file_exists(frontend_dir / "src" / "index.tsx", "index.tsx")
    all_checks_passed &= check_directory_exists(frontend_dir / "src" / "components", "components/ directory")
    all_checks_passed &= check_directory_exists(frontend_dir / "src" / "services", "services/ directory")
    all_checks_passed &= check_directory_exists(frontend_dir / "src" / "types", "types/ directory")
    print()
    
    # Check frontend components
    print("🎨 Frontend Components:")
    components_dir = frontend_dir / "src" / "components"
    all_checks_passed &= check_file_exists(components_dir / "GameCanvas.tsx", "GameCanvas.tsx")
    all_checks_passed &= check_file_exists(components_dir / "ChatBox.tsx", "ChatBox.tsx")
    all_checks_passed &= check_file_exists(components_dir / "LoginScreen.tsx", "LoginScreen.tsx")
    all_checks_passed &= check_file_exists(components_dir / "AvatarSelector.tsx", "AvatarSelector.tsx")
    print()
    
    # Check services
    print("🔧 Services:")
    services_dir = frontend_dir / "src" / "services"
    all_checks_passed &= check_file_exists(services_dir / "api.ts", "api.ts")
    all_checks_passed &= check_file_exists(services_dir / "websocket.ts", "websocket.ts")
    print()
    
    # Summary
    print("=" * 60)
    if all_checks_passed:
        print("✅ All checks passed!")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Run: docker compose up --build")
        print("2. Visit: http://localhost:3000")
        print("3. Check API docs: http://localhost:8000/docs")
        return 0
    else:
        print("❌ Some checks failed")
        print("=" * 60)
        return 1

if __name__ == "__main__":
    sys.exit(main())
