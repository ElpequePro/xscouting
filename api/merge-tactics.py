from http.server import BaseHTTPRequestHandler
import json
import os
import sys
from itertools import combinations
from collections import Counter

# --- LÓGICA DEL JUEGO (Tus funciones originales) ---

# Ajuste de rutas para Vercel:
# En Vercel, el archivo se ejecuta en un entorno donde __file__ funciona, 
# pero es mejor usar rutas relativas desde el script.
BASE_DIR = os.path.dirname(__file__)
DATA_PATH_BASE = os.path.join(BASE_DIR, "data", "merge-tactics")

def load_cards_from_json(version):
    filepath = os.path.join(DATA_PATH_BASE, f"cards-v{version}.json")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        return [] # Manejo simple de error

def load_traits_from_json(version):
    filepath = os.path.join(DATA_PATH_BASE, f"traits-v{version}.json")
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        return {}

def _calculate_active_combos(team_cards, dummy_traits, traits_data):
    # ... (COPIA AQUÍ EL CONTENIDO EXACTO DE TU FUNCIÓN _calculate_active_combos ORIGINAL) ...
    # Por brevedad no la repito, pero debe ser idéntica a tu script anterior.
    if not team_cards: return []
    all_traits = []
    for card in team_cards:
        all_traits.extend([card.get("trait1"), card.get("trait2")])
    all_traits = [t for t in all_traits if t]
    if dummy_traits: all_traits.extend(dummy_traits)
    trait_counts = Counter(all_traits)
    active_combos = []
    for trait, count in trait_counts.items():
        if trait in traits_data:
            levels = traits_data[trait].get("levels", [])
            best_lvl = None
            for lvl in sorted(levels, key=lambda x: x.get("units", 0), reverse=True):
                if count >= lvl.get("units", float('inf')):
                    best_lvl = lvl
                    break
            if best_lvl:
                active_combos.append({"name": trait, "count": count, "is_max": best_lvl == levels[-1]})
    return active_combos

def find_best_completion(numTroops, cards_data, traits_data, current_team_names=[], desired_traits=[], dummy_traits=[]):
    # ... (COPIA TU LÓGICA DE find_best_completion AQUÍ) ...
    # Asegúrate de NO usar prints para depurar, solo return.
    
    # 1. Reconstruir equipo actual
    current_team = [c for c in cards_data if c["name"] in current_team_names]
    
    # Lógica simplificada para el ejemplo (Usa tu original completa):
    needed = numTroops - len(current_team)
    available = [c for c in cards_data if c["name"] not in current_team_names]
    
    best_res = None
    best_score = -100000

    for group in combinations(available, needed):
        team = current_team + list(group)
        combos = _calculate_active_combos(team, dummy_traits, traits_data)
        
        # Score simple
        score = len(combos) * 100 - sum(c['elixir'] for c in group)
        
        if score > best_score:
            best_score = score
            best_res = (group, combos)
            
    if not best_res:
        raise Exception("No solution found")
        
    return best_res


# --- HANDLER PARA VERCEL ---

class handler(BaseHTTPRequestHandler):
 
    def do_POST(self):
        try:
            # 1. Leer el cuerpo de la petición
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            # 2. Extraer datos
            version = data.get('version', '3')
            num_troops = data.get('numTroops', 6)
            current_names = data.get('current_team_names', [])
            desired = data.get('desired_traits', [])

            # 3. Cargar datos
            cards = load_cards_from_json(version)
            traits = load_traits_from_json(version)

            # 4. Ejecutar lógica
            comp_cards, final_combos = find_best_completion(
                num_troops, cards, traits, current_names, desired
            )

            # 5. Responder Exitosamente
            response = {
                "success": True,
                "completion_names": [c["name"] for c in comp_cards],
                "completion_elixir": sum(c["elixir"] for c in comp_cards),
                "final_combos": final_combos
            }
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))

        except Exception as e:
            # Manejo de errores
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = {"success": False, "error": str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))

    # Soporte para GET (opcional, para ver si está vivo)
    def do_GET(self):
        self.send_response(200)
        self.wfile.write("Python merging API is running".encode())