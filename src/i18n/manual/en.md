# User Manual — ISOTHOPE

Welcome to **ISOTHOPE**, the nuclear transmutation puzzle game built on real scientific data from the IAEA (NUBASE / LiveChart).

## 🎯 1. Goal of the Game

You control an atomic nucleus displayed at the center of the **Segrè Chart** (the nuclear physicist's periodic table):
- The horizontal axis represents the **number of neutrons (`N`)**.
- The vertical axis represents the **number of protons (`Z`)**, which defines the chemical element.

In each level, you start from an **initial isotope** and must reach a **target isotope** (highlighted with a golden border on the grid) by smartly combining particle bombardments and natural radioactive decays.

> **Tip:** Sometimes let nature do the work for you! A natural radioactive decay saves your precious particles.

## ⚡ 2. Actions and Controls

Use the buttons below the grid to bombard your nucleus before it decays:

| Action | Effect on Nucleus | Grid Movement | PC Shortcut |
| :--- | :--- | :--- | :--- |
| **⚛ +n** (Neutron) | Adds 1 neutron (`N + 1`) | **➔ Right** (same element, heavier) | `N` or `→` |
| **⚡ +e⁻** (Electron) | Electron capture (`Z - 1, N + 1`) | **↘ Bottom-right diagonal** | `E` or `↓` |
| **🔴 +p** (Proton) | Adds 1 proton (`Z + 1`) | **↑ Up** (next element) | `P` or `↑` |
| **Restart** | Resets the current level | Returns to start nucleus | `R` |

## ☢️ 3. Stability and Radioactive Decays

Each cell on the grid is colored according to the real physical behavior of the isotope:

- **⬛ Black (Stable)**: The nucleus does not decay. The timer stops and you have unlimited time to think. *Warning: if you land on a stable isotope that is not your target and run out of particles, it's Game Over!*
- **🟦 Blue (β⁻ — Beta minus)**: Neutron excess. A neutron turns into a proton (`Z + 1, N - 1` ➔ moves **↖ top-left diagonal**).
- **🟧 Orange (β⁺ / ε — Beta plus or Electron capture)**: Proton excess. A proton turns into a neutron (`Z - 1, N + 1` ➔ moves **↘ bottom-right diagonal**).
- **🟨 Yellow (α — Alpha)**: Heavy nucleus that ejects an alpha particle (`⁴He`) made of 2 protons and 2 neutrons (`Z - 2, N - 2` ➔ moves **↙ 2 cells down and 2 left**).
- **🟥 Red (p — Proton emission)**: Extremely proton-rich nucleus that directly ejects 1 proton (`Z - 1` ➔ **↓ 1 cell down**).
- **🟪 Purple (n — Neutron emission)**: Extremely neutron-rich nucleus that directly ejects 1 neutron (`N - 1` ➔ **← 1 cell left**).
- **🟩 Green (SF — Spontaneous fission)**: The heavy nucleus splits apart spontaneously.

## 🧭 4. Levels and Free Mode (Level 0)

- **Level Briefing**: Click anywhere on the **level description bar** at the bottom of the screen to open the scientific and historical briefing for the current mission.
- **Level Selector**: Click the numbered button (e.g. `1/13`) on the left of the level bar to switch missions.
- **Level 0 — Free Mode (Sandbox)**: Located at the very top of the level list, it gives you unlimited particles (`∞`) and lets you click directly on any cell in the grid or the `I S O Th O P E` title banner to explore the chart of nuclides.

## 📈 5. The Logarithmic Time Law

In nature, isotope half-lives (`T½`) span from microseconds (`10⁻⁶ s`) to billions of years (`10¹⁷ s`). To compress these 23 orders of magnitude into a few seconds of gameplay while preserving the true stability hierarchy of every isotope, **ISOTHOPE** uses a logarithmic law:

`Game_Time = clamp(Base + Slope × log10(T½), Min, Max)`

You can inspect the curve and customize the physical parameters below:
