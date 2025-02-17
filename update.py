import matplotlib.pyplot as plt
import seaborn as sns

sns.set_theme(style="whitegrid")
import pandas as pd
import os
from unidecode import unidecode
import geojson

path_geodata = r"C:\Users\ade\OneDrive - TRANSITEC\D0-3_2301-Reseau_TC_Afrique\3-Ingenierie\ADE\SIG\layers\villes_africaines_points.csv"
path_img = r"C:\Users\ade\OneDrive - TRANSITEC\D0-3_2301-Reseau_TC_Afrique\3-Ingenierie\ADE\transports_villes_africaines\img"
path_excel = r"C:\Users\ade\OneDrive - TRANSITEC\D0-3_2301-Reseau_TC_Afrique\3-Ingenierie\BD\V1-Modes_of_Transport_per_City.xlsx"
path_geojson = r"C:\Users\ade\OneDrive - TRANSITEC\D0-3_2301-Reseau_TC_Afrique\3-Ingenierie\ADE\transports_villes_africaines\villes_africaines.geojson"

df_geodata = pd.read_csv(path_geodata)
df_geodata["Name"] = df_geodata["Name"].apply(lambda x: x.strip())

df_excel = pd.read_excel(
    path_excel, sheet_name="BD-nettoyé", header=[0, 1], index_col=[0]
)
df_excel.fillna(0, inplace=True)

# /!\ a bien strip les names avant de les matcher
df_excel.index = df_excel.index.str.strip()

df_excel = df_excel[
    [
        ("BRT + BHNS", "Km d'infrastructure en Exploitation"),
        ("BRT + BHNS", "Km d'infrastructure en Travaux"),
        ("BRT + BHNS", "Km d'infrastructure en Etude"),
        ("Tramway", "Km d'infrastructure en Exploitation"),
        ("Tramway", "Km d'infrastructure en Travaux"),
        ("Tramway", "Km d'infrastructure en Etude"),
        ("Métro + RER", "Km d'infrastructure en Exploitation"),
        ("Métro + RER", "Km d'infrastructure en Travaux"),
        ("Métro + RER", "Km d'infrastructure en Etude"),
    ]
]

# couleurs par mode et transparence -> palette TIC

# BRT :
# Km d'infrastructure en Exploitation -> #df771c
# Km d'infrastructure en Travaux -> #e5a513
# Km d'infrastructure en Etude -> #ffd530

# Tramway :
# Km d'infrastructure en Exploitation -> #5a853c
# Km d'infrastructure en Travaux -> #74b152
# Km d'infrastructure en Etude -> #a3d063

# Métro+RER
# Km d'infrastructure en Exploitation -> #005582
# Km d'infrastructure en Travaux -> #2384c6
# Km d'infrastructure en Etude -> #74cee2

palette_expl = {
    "brt_expl": "#df771c",
    "brt_trav": "#e5a513",
    "brt_etud": "#ffd530",
    "tram_expl": "#5a853c",
    "tram_trav": "#74b152",
    "tram_etud": "#a3d063",
    "metr_expl": "#005582",
    "metr_trav": "#2384c6",
    "metr_etud": "#74cee2",
}

dict_colors = {"BRT + BHNS": "#df771c", "Tramway": "#5a853c", "Métro + RER": "#005582"}

palette_100 = sns.color_palette(["#df771c", "#5a853c", "#005582"])
palette_80 = sns.color_palette(["#e5a513", "#74b152", "#2384c6"])
palette_60 = sns.color_palette(["#ffd530", "#a3d063", "#74cee2"])

df_excel[("BRT + BHNS", "transport")] = "BRT + BHNS"
df_excel[("Tramway", "transport")] = "Tramway"
df_excel[("Métro + RER", "transport")] = "Métro + RER"

df = pd.concat([df_excel["BRT + BHNS"], df_excel["Tramway"], df_excel["Métro + RER"]])

df["Exploitation"] = df["Km d'infrastructure en Exploitation"]
df["Travaux"] = (
    df["Km d'infrastructure en Exploitation"] + df["Km d'infrastructure en Travaux"]
)
df["Etude"] = (
    df["Km d'infrastructure en Exploitation"]
    + df["Km d'infrastructure en Travaux"]
    + df["Km d'infrastructure en Etude"]
)

df_par_transport = df[["Exploitation", "Travaux", "Etude", "transport"]]

# production des histogrammes dans des img en png. A rotationner de 90° vers la droite ensuite.
cities_colors_dict = dict()

for name in df_par_transport.index:

    df_par_ville = df_par_transport.loc[name]

    plt.figure(figsize=(3, 8))

    ax = sns.barplot(x="transport", y="Etude", data=df_par_ville, palette=palette_60)

    sns.barplot(
        x="transport",
        y="Travaux",
        data=df_par_ville,
        palette=palette_80,
    )

    sns.barplot(
        x="transport",
        y="Exploitation",
        data=df_par_ville,
        palette=palette_100,
    )

    plt.xticks(rotation=90)
    ax.yaxis.tick_right()
    plt.yticks(rotation=90)
    ax.set_xlabel("")
    ax.set_ylabel("Km")
    ax.yaxis.set_label_position("right")
    ax.yaxis.label.set_position((1, 0.98))

    plt.savefig(os.path.join(path_img, name + ".png"), dpi=200, bbox_inches="tight")

    if df_par_ville[["Exploitation", "Travaux", "Etude"]].sum().sum() == 0:
        # if the city has 0 km of tranpsort lines
        city_color = "#808586"

    else:
        # find which tranpsort has the longest infrastructure
        idx_longest = df_par_ville.reset_index().Etude.idxmax()
        transport = df_par_ville.reset_index().transport.iloc[idx_longest]
        city_color = dict_colors.get(transport)

    cities_colors_dict.update({name: city_color})


features = []

for name in df_par_transport.index:

    if (
        sum(
            df_par_transport.loc[name].Exploitation
            + df_par_transport.loc[name].Travaux
            + df_par_transport.loc[name].Etude
        )
        > 0
    ):
        infos = df_geodata[df_geodata["Name"] == name]
        feature = geojson.Feature(
            geometry=geojson.Point((float(infos["x"]), float(infos["y"]))),
            properties={
                "name": name,
                "img_path": "img/" + name + ".png",
                "color": cities_colors_dict.get(name),
            },
        )

        features.append(feature)

feature_collection = geojson.FeatureCollection(features)

# Sauvegarder dans un fichier GeoJSON
with open(path_geojson, "w") as f:
    geojson.dump(feature_collection, f)
