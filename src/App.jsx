import './App.css';
import axios from 'axios'

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
const POKEMON_ID_MAX = 1025;

const createCard = (data) => {
  const name = data.name;
  const sprite = data.sprites["front_default"] ?? data.sprites.find(sprite => sprite !== null);
  const types = data.types.map(type => type.type.name);

  const section = document.createElement('section');
  const h2 = document.createElement('h2');
  const img = document.createElement('img');
  const typesList = document.createElement('ul');

  section.classList.add("poke-card");
  typesList.classList.add("types");

  h2.innerText = name;
  img.src = sprite;
  img.alt = name;

  for (const type of types) {
    const typeListItem = document.createElement('li');
    typeListItem.classList.add("type");
    typeListItem.innerText = type;

    typesList.appendChild(typeListItem);
  }

  section.appendChild(h2);
  section.appendChild(img);
  section.appendChild(typesList);

  document.getElementById('cards').appendChild(section);

  const delay = 200 + document.querySelectorAll('.poke-card').length * 50;
  setTimeout(() => section.classList.add("flip-in"), delay);
}

const getDataByPokeNameOrId = async (nameOrId) => {
  console.log("Getting that pokemon!");

  const url = `${POKEAPI_BASE}/pokemon/${nameOrId}`;

  const { data } = await axios.get(url);

  return data;
}

const handleRandomPokemonButton = async () => {
  document.getElementById('cards').innerHTML = "Loading...";

  const randomPokemonId = Math.floor(Math.random() * POKEMON_ID_MAX);

  const data = await getDataByPokeNameOrId(randomPokemonId);

  const types = data.types.map(type => type.type.name);

  document.getElementById('cards').innerHTML = "";

  createCard(data);

  getSimilarPokemon(types, data.name);
}

const getSimilarPokemon = async (types, firstPokemon) => {
  console.log(`Getting pokemon of types: ${types.join(", ")}`);

  const pokemonOfEachType = [];
  for (const type of types) {
    const url = `${POKEAPI_BASE}/type/${type}`;
    const { data } = await axios.get(url);
    pokemonOfEachType.push(data.pokemon.map(pokemon => pokemon.pokemon.name));
  }

  const pokemonWithSameTypes = []

  for (const pokemon of pokemonOfEachType[0]) {
    let match = true;

    for (const typeList of pokemonOfEachType.slice(1)) {
      if (!typeList.includes(pokemon)) {
        match = false;
        break;
      };
    }

    if (match) pokemonWithSameTypes.push(pokemon);
  }

  console.log("Pokemon with same types: " + pokemonWithSameTypes.join(", "));
  pokemonWithSameTypes.filter(pokemon => pokemon !== firstPokemon).slice(0, 5).forEach(async pokemon => {
    createCard(await getDataByPokeNameOrId(pokemon));
  })
}

function App() {
  return (
    <>
      <h1>Pokemon Theme Team!</h1>
      <input onClick={handleRandomPokemonButton} type='button' value={"Get Random Pokemon!"} />
      <div id='cards'></div>
    </>
  )
}

export default App
