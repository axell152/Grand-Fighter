# Grand Fighter — Prototype

Jeu de combat en équipe, temps réel (esprit Street Fighter), dans un univers pirates/aventure
100% original (aucune IP existante utilisée — personnages, noms et pouvoirs inventés).

## Lancer le projet

```bash
npm install
npm run dev
```

Puis ouvre l'URL affichée (en général http://localhost:5173).

Build de production :
```bash
npm run build
npm run preview
```

## Déploiement (GitHub + Vercel)

1. `git init && git add . && git commit -m "Prototype Grand Fighter"`
2. Pousse sur un repo GitHub.
3. Sur Vercel : "Import Project" → sélectionne le repo → framework détecté automatiquement (Vite) → Deploy.

## Contrôles

| Action | Touche |
|---|---|
| Déplacement gauche / droite | Q / D |
| Sauter | Z |
| Garde (parer, maintenir) | U |
| Attaque corps à corps | I |
| Spécial (jauge pleine) | O |
| Changer de personnage actif | T |

Note : le coup "lourd" du moveset (utilisé par l'IA adverse) n'a pas de touche dédiée côté
joueur pour l'instant — I déclenche l'attaque légère du perso actif.

## Structure du projet

```
src/
  config.js                 # constantes globales (dimensions, physique, timings)
  data/characters.js        # roster jouable + boss (stats, movesets, hitboxes)
  entities/Fighter.js        # state machine d'un combattant (mouvement, attaques, hitstun...)
  systems/InputBuffer.js     # buffer d'inputs pour ne pas perdre un coup pendant la recovery
  systems/HitboxManager.js   # résolution des collisions hitbox/hurtbox entre tous les fighters
  systems/TeamManager.js     # gestion d'une équipe (actif, switch, KO)
  systems/AIController.js    # IA des adversaires CPU (approche, attaque, garde)
  systems/BossController.js  # IA de boss avec phases selon les PV restants
  ui/HUD.js                  # barres de vie, jauge de spécial, timer, rounds
  scenes/
    TeamSelectScene.js       # choix de l'équipe (2-3 persos)
    ModeSelectScene.js       # choix du mode de jeu
    CombatScene.js           # boucle de combat principale
    ResultScene.js           # écran de victoire/défaite
  main.js                    # bootstrap Phaser
```

## Modes de jeu déjà fonctionnels

- **Duel d'équipe** : best of 3 rounds. Un perso KO est éliminé pour le reste du combat,
  l'équipe passe automatiquement au suivant. Switch manuel possible avec **T** entre les rounds
  (ou à tout moment hors combat actif).
- **Vague d'ennemis** : 2 adversaires simultanés, pas de reset de vie entre les KO, jusqu'à
  élimination complète d'une des deux équipes.
- **Combat de boss** : Kronn, Tyran des Marées — IA à 3 phases qui devient plus agressive
  quand ses PV baissent.

## Roster actuel (3 persos + 1 boss)

- **Kaira "Élastik"** — corps-à-corps, allonge élastique, gros dégâts de poing
- **Ryn Kurogane** — sabreur rapide, enchaînements précis
- **Tempest Voss** — distance/contrôle, projectile électrique + zone spéciale
- **Kronn, Tyran des Marées** (boss) — lent mais très résistant, attaque de zone dévastatrice

## Pistes d'évolution (non implémentées)

- Vrais sprites animés (actuellement : rectangles/cercles placeholder générés en code)
- Combos réels basés sur des séquences d'inputs (le buffer actuel gère surtout l'enchaînement recovery→coup suivant)
- Sons et musique (Web Audio)
- Écran de sélection d'équipe côté CPU (actuellement aléatoire)
- Sauvegarde de progression / déblocage de personnages
- Overworld bateau/îles pour relier les combats à une aventure (comme discuté)
