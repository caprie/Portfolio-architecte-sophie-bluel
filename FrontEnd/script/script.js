
async function getWorks() {
  // "async" continue d'exécuter les autres tâches pendant que cette opération se termine

  // Déclare l'URL de l'API qui contient les données des "works"
  const url = "http://localhost:5678/api/works";
  try {
    // Envoie une requête HTTP GET à l'API
    // "await" attend que la réponse arrive avant de continuer
    const response = await fetch(url);

    // Vérifie si la réponse est bonne
    if (!response.ok) {
      // Si ce n'est pas le cas, renvoie une erreur avec le statut HTTP
      throw new Error(`Response status: ${response.status}`);
    }

    // Convertit la réponse en format JSON pour qu’elle soit utilisable dans ton code.
    //Ex: si l'API retourne la liste de travaux, elle sera transformée en tableau d'objets JavaScript.
    return await response.json();
  } catch (error) {
    // Si une erreur se produit affiche un message dans la console
    console.error(error.message);
  }
}
async function showWorks(){
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
  const works = await getWorks();
 
  works.forEach(element => {
    
    let figure = document.createElement("figure");
    let img = document.createElement("img");
    img.src=element.imageUrl;
    img.alt=element.title;
    let figureCaption= document.createElement("figureCaption");
    figureCaption.textContent = element.title;
    figure.appendChild(img);
    figure.appendChild(figureCaption);
    gallery.appendChild(figure);
  });
}
showWorks();
