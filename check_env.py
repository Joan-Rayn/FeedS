#!/usr/bin/env python3
"""
Script de vérification de l'environnement FeedS
Vérifie que tous les prérequis sont installés et configurés correctement
"""

import sys
import subprocess
import os
from pathlib import Path

class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.BLUE}{Colors.BOLD}{text:^60}{Colors.END}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.END}\n")

def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.END}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")

def check_command(command, name, min_version=None):
    """Vérifie si une commande est disponible"""
    try:
        result = subprocess.run([command, '--version'], 
                              capture_output=True, 
                              text=True, 
                              timeout=5)
        if result.returncode == 0:
            version = result.stdout.split('\n')[0]
            print_success(f"{name} est installé: {version}")
            return True
        else:
            print_error(f"{name} n'est pas installé ou ne fonctionne pas correctement")
            return False
    except FileNotFoundError:
        print_error(f"{name} n'est pas installé")
        return False
    except subprocess.TimeoutExpired:
        print_error(f"{name} ne répond pas")
        return False
    except Exception as e:
        print_error(f"Erreur lors de la vérification de {name}: {str(e)}")
        return False

def check_python_packages():
    """Vérifie que les packages Python requis sont installés"""
    print("\nVérification des packages Python...")
    requirements_file = Path(__file__).parent / 'backend' / 'requirements.txt'
    
    if not requirements_file.exists():
        print_error("Fichier requirements.txt introuvable")
        return False
    
    try:
        with open(requirements_file, 'r') as f:
            packages = [line.split('==')[0].strip() for line in f if line.strip() and not line.startswith('#')]
        
        missing_packages = []
        for package in packages[:5]:  # Vérifie seulement les 5 premiers pour la rapidité
            try:
                __import__(package.replace('-', '_'))
                print_success(f"Package {package} installé")
            except ImportError:
                missing_packages.append(package)
        
        if missing_packages:
            print_warning(f"Packages manquants: {', '.join(missing_packages)}")
            print(f"   Exécutez: pip install -r requirements.txt")
            return False
        return True
    except Exception as e:
        print_error(f"Erreur lors de la vérification des packages: {str(e)}")
        return False

def check_postgresql():
    """Vérifie que PostgreSQL est accessible"""
    print("\nVérification de PostgreSQL...")
    try:
        result = subprocess.run(['psql', '--version'], 
                              capture_output=True, 
                              text=True, 
                              timeout=5)
        if result.returncode == 0:
            print_success(f"PostgreSQL est installé: {result.stdout.strip()}")
            return True
        else:
            print_error("PostgreSQL n'est pas installé ou ne fonctionne pas")
            return False
    except FileNotFoundError:
        print_error("PostgreSQL n'est pas installé ou n'est pas dans le PATH")
        print("   Téléchargez-le depuis: https://www.postgresql.org/download/")
        return False
    except Exception as e:
        print_error(f"Erreur lors de la vérification de PostgreSQL: {str(e)}")
        return False

def check_database_exists():
    """Vérifie que la base de données feeds_db existe"""
    print("\nVérification de la base de données feeds_db...")
    try:
        # Note: Cette commande nécessite que PostgreSQL soit configuré
        result = subprocess.run([
            'psql', 
            '-U', 'postgres', 
            '-lqt'
        ], capture_output=True, text=True, timeout=5)
        
        if 'feeds_db' in result.stdout:
            print_success("Base de données feeds_db trouvée")
            return True
        else:
            print_warning("Base de données feeds_db non trouvée")
            print("   Exécutez: python backend/create_db.py")
            return False
    except Exception as e:
        print_warning("Impossible de vérifier la base de données")
        print(f"   Assurez-vous que PostgreSQL est démarré et configuré")
        return False

def check_files():
    """Vérifie que les fichiers importants existent"""
    print("\nVérification des fichiers du projet...")
    
    files_to_check = [
        ('backend/app/main.py', 'Fichier principal backend'),
        ('backend/requirements.txt', 'Dépendances Python'),
        ('frontend/package.json', 'Configuration frontend'),
        ('frontend/src/App.jsx', 'Application React'),
        ('database/init.sql', 'Script d\'initialisation SQL'),
    ]
    
    all_exist = True
    for file_path, description in files_to_check:
        full_path = Path(__file__).parent / file_path
        if full_path.exists():
            print_success(f"{description} trouvé")
        else:
            print_error(f"{description} manquant: {file_path}")
            all_exist = False
    
    return all_exist

def check_env_files():
    """Vérifie les fichiers d'environnement"""
    print("\nVérification des fichiers d'environnement...")
    
    frontend_env = Path(__file__).parent / 'frontend' / '.env'
    
    if frontend_env.exists():
        print_success("Fichier .env frontend trouvé")
    else:
        print_warning("Fichier .env frontend manquant")
        print("   Copiez .env.example vers .env et configurez les variables")

def main():
    print_header("VÉRIFICATION DE L'ENVIRONNEMENT FEEDS")
    
    checks = {
        'Python': lambda: check_command('python', 'Python'),
        'Node.js': lambda: check_command('node', 'Node.js'),
        'npm': lambda: check_command('npm', 'npm'),
        'PostgreSQL': check_postgresql,
        'Fichiers': check_files,
        'Environnement': check_env_files,
    }
    
    results = {}
    for name, check_func in checks.items():
        try:
            results[name] = check_func()
        except Exception as e:
            print_error(f"Erreur lors de la vérification de {name}: {str(e)}")
            results[name] = False
    
    # Résumé
    print_header("RÉSUMÉ")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    print(f"\nVérifications réussies: {passed}/{total}\n")
    
    if passed == total:
        print_success("✓ Tous les prérequis sont satisfaits!")
        print("\nVous pouvez maintenant lancer l'application:")
        print("  1. Backend:  cd backend && uvicorn app.main:app --reload")
        print("  2. Frontend: cd frontend && npm run dev")
        return 0
    else:
        print_warning("⚠ Certains prérequis ne sont pas satisfaits")
        print("\nConsultez les messages ci-dessus pour résoudre les problèmes.")
        print("Documentation: QUICK_START.md")
        return 1

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Vérification interrompue{Colors.END}")
        sys.exit(130)
