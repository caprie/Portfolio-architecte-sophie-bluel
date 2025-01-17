console.log("Script chargé !");
console.log("Champ titre :", document.querySelector("#title"));
console.log("Champ catégorie :", document.querySelector("#category"));
console.log("Champ photo :", document.querySelector("#image"));
console.log("Bouton valider :", document.querySelector("#submit-photo"));
console.log("Formulaire :", document.querySelector("#add-project-form"));

let openModalGalleryCallCount = 0; // Variable globale pour compter les appels
let showWorksCallCount = 0; // Variable globale pour compter les appels

//----------RECUPERATION DES API ----------

// Fonction pour récupérer les TRAVAUX depuis l'API
async function getWorks() {
  const url = "http://localhost:5678/api/works";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const works = await response.json();
    return works;
  } catch (error) {
    console.error("Erreur lors de la récupération des works :", error.message);
  }
}

// Fonction pour récupérer les CATEGORIES depuis l'API
async function getCategories() {
  const url = "http://localhost:5678/api/categories";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur : ${response.status}`);
    }
    // Convertit les données de la réponse en JSON pour les rendre utilisables
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des catégories :",
      error.message
    );
  }
}

//---------------------STYLE DYNAMIQUE BTN NAV  --------------------

const links = document.querySelectorAll("nav a");

const currentPath = window.location.href; //recupere l'url de la page affichée

links.forEach((link) => {
  if (currentPath === link.href) {
    link.classList.add("active");
  }
});

//------------------- style logout -----------------
function toggleLoginLogoutButton() {
  const loginButton = document.querySelector('a[href="login.html#login"]');
  const token = localStorage.getItem("authToken");

  if (token) {
    // Si l'admin est connecté
    loginButton.textContent = "Logout";
    loginButton.style.fontWeight = "bold";
    loginButton.href = "login.html"; // en attente lien modale

    // Ajoute un event listener pour déconnecter
    loginButton.addEventListener("click", () => {
      localStorage.removeItem("authToken"); // Supprime le token
    });
  } else {
    // Si l'admin n'est pas connecté
    loginButton.textContent = "Login";
    loginButton.style.fontWeight = "normal";
    loginButton.href = "login.html";
  }
}

// --------------- CREATION ET AFFICHAGE DES CATEGORIES ----------

// Fonction pour créer et afficher le menu des catégories
async function createCategoryMenu() {

  // Récupère les catégories depuis l'API
  const categories = await getCategories();
  if (!categories) {
    console.error("Pas de catégories récupérées");
    return;
  }

  // --------------------- AJOUT DES BUTTONS ET CATEGORIES --------------------

  // -------------------- CONTAINER ------------------------

  const portfolioSection = document.querySelector("#portfolio");
  const menu = document.createElement("div");
  menu.id = "menu-categories";
  portfolioSection.insertBefore(
    menu,
    portfolioSection.querySelector(".gallery")
  );

  // ---------------------------- BUTTONS -------------------

  // créer un bouton "Tous" pour permettre d'afficher tous les travaux
  const allButton = document.createElement("button");
  allButton.textContent = "Tous";
  allButton.dataset.category = "all";
  menu.appendChild(allButton);

  // Crée un bouton pour chaque catégorie récupérée et l'ajoute au menu
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.textContent = category.name;
    button.dataset.category = category.id;
    menu.appendChild(button);
  });

  addFilterEvents(); // ajoute les actions quand on clique sur les boutons
}

// -------------------- EVENTS ----------------

// Fonction pour ajouter des événements de clic sur chaque bouton de catégorie
function addFilterEvents() {
  const buttons = document.querySelectorAll("#menu-categories button");
  if (buttons.length === 0) {
    console.error("Aucun bouton de catégorie trouvé");
    return;
  }

  // Pour chaque bouton, on ajoute une action à faire quand on clique dessus
  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      buttons.forEach((button) => {
        button.classList.remove("active");
      });
      e.target.classList.add("active");
      const categoryId = button.dataset.category;
      showWorks(categoryId);
    });
  });
}

// --------------------------- AFFICHAGE DE LA GAlLERY ----------------

// Fonction pour afficher les travaux dans la galerie
//let showWorksCallCount = 0;

async function showWorks(categoryId = "all") {
  showWorksCallCount++;
  console.log(`showWorks appelée ${showWorksCallCount} fois`);

  const gallery = document.querySelector(".gallery");
  if (!gallery) {
    console.error("La galerie est introuvable");
    return;
  }

  // On vide la galerie pour ne pas mélanger les nouveaux travaux avec les anciens
  gallery.innerHTML = "";
  // On récupère tous les travaux depuis le serveur
  const works = await getWorks();
  if (!works) {
    console.error("Aucun travail récupéré");
    return;
  }

  // ----------------------- FILTRES ----------------------------

  // On filtre les travaux selon la catégorie choisie
  const filteredWorks =
    categoryId === "all"
      ? works
      : works.filter((work) => work.categoryId === parseInt(categoryId));

  // Pour chaque travail filtré, on crée des éléments pour l'afficher dans la galerie
  filteredWorks.forEach((element) => {
    let figure = document.createElement("figure");
    let img = document.createElement("img");
    img.src = element.imageUrl;
    img.alt = element.title;
    let figureCaption = document.createElement("figcaption");
    figureCaption.textContent = element.title;
    figure.appendChild(img);
    figure.appendChild(figureCaption);
    gallery.appendChild(figure);
  });
}

// ----------------- BARRE NOIRE EN MODE ÉDITION ------------------
function toggleEditBar() {
  const editBar = document.querySelector("#edit-bar");
  const token = localStorage.getItem("authToken");

  if (token) {
    // Si l'utilisateur est connecté
    editBar.classList.remove("hidden"); // Affiche la barre
  } else {
    editBar.classList.add("hidden"); // Cache la barre
  }
}

// ----------------- LANCEMENT DE LA PAGE CHARGEE ----------------

// Fonction principale pour tout lancer quand la page est chargée

  

  // Fonction d'initialisation pour afficher les catégories et les travaux
  async function init() {
    await createCategoryMenu();
    await showWorks();
    //toggleAdminFeatures(); // Affiche les fonctionnalités admin

    // Réinitialise l'état du bouton
    const editButton = document.querySelector("#edit-mode");
    if (editButton) {
      editButton.classList.add("hidden"); // Cache le bouton par défaut
      
    }

    toggleAdminFeatures();
    toggleLoginLogoutButton();
    toggleEditBar();
  }

  // Appelle la fonction d'initialisation dès le chargement de la page
  init();

// ----------------- INTERACTIONS UTILISATEUR ------------------

// Gestion du clic sur le bouton "Modifier"
document.querySelector("#edit-mode").addEventListener("click", () => {
  const button = document.querySelector("#edit-mode");

  // Appliquer la classe pour l'animation
  button.classList.add("animate-dissolve"); 
  

  // Après l'animation, rediriger vers la nouvelle page
  setTimeout(() => {
    openModal("#gallery-modal"); // Ouvre la modale galerie
  }, 300); 
  console.log("test bouton: bouton appel modifier")
});


// ----------------- FONCTIONNALITÉS ADMIN ---------------------
/*après init() pour etre exécuté au chargement de la page, après le contenu dynamique.*/

// Fonction pour afficher ou masquer les fonctionnalités admin
function toggleAdminFeatures() {
  const token = localStorage.getItem("authToken");
  const editButton = document.querySelector("#edit-mode");
  const filters = document.querySelector("#menu-categories");

  if (!editButton) {
    return; // Arrête la fonction ici si l'élément n'existe pas
  }

  if (token) {
    editButton.classList.remove("hidden");
    filters.style.display = "none";
  } else {
    editButton.classList.add("hidden");
  }
  // Vérifie l'état actuel du bouton
  console.log("État du bouton :", editButton.classList);
}

// Ajouter l'événement au bouton "modifier"
document.querySelector("#edit-mode").addEventListener("click", () => {
  window.location.href = "#";
});

// --------------------------------fonctionnalités pour la modale

// Sélection des éléments
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector("#gallery-modal");
  const openModalButton = document.querySelector("#edit-mode"); // Bouton "Modifier"
  const closeModalButton = document.querySelector(".close-modal");
  const modalGallery = document.querySelector(".gallery-modal");

  // Fonction pour ouvrir la modale et charger les images
  function openModalGallery() {
    openModalGalleryCallCount++;
    console.log(`openModalGallery appelée ${openModalGalleryCallCount} fois`);
    window.location.href = "#gallery-modal"; // Déplace la fenêtre vers la modale
    modal.classList.remove("hidden");
    modalGallery.innerHTML = ""; // Vide la galerie existante
    console.log("Modale ouverte et galerie vidée."); // Vérifie que cette étape passe

    // Charge les images via l'API
    getWorks() // Récupère les travaux
      .then((works) => {
        works.forEach((work) => {
          console.log(`Création de figure pour : ${work.title}`); // Vérifie chaque itération

          // Crée l'élément figure pour chaque travail
          const figure = document.createElement("figure");

          // Crée l'icône poubelle
          const trashIcon = document.createElement("i");
          trashIcon.className = "fa-solid fa-trash-can trash-icon"; // Icône poubelle (Font Awesome)

          // Ajoute un événement au clic sur l'icône poubelle
          trashIcon.addEventListener("click", async () => {
            if (confirm(`Voulez-vous vraiment supprimer ${work.title} ?`)) {
              try {
                const response = await fetch(
                  `http://localhost:5678/api/works/${work.id}`,
                  {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem(
                        "authToken"
                      )}`,
                    },
                  }
                );

                if (response.ok) {
                  console.log(`${work.title} supprimé.`);
                  figure.remove(); // Supprime l'élément du DOM
                } else {
                  console.error(
                    `Erreur lors de la suppression : ${response.status}`
                  );
                }
              } catch (error) {
                console.error("Erreur lors de la requête DELETE :", error);
              }
            }
          });

          // Crée l'image
          const imgElement = document.createElement("img");
          imgElement.src = work.imageUrl;
          imgElement.alt = work.title;

          // Ajoute les éléments aux figures
          figure.appendChild(imgElement);
          figure.appendChild(trashIcon);

          // Ajoute la figure à la galerie
          modalGallery.appendChild(figure);
        });
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des works :", error);
      });
  }

  // Fonction pour fermer la modale
  function closeModalGallery() {
    modal.classList.add("hidden");
  }

  // Écouteurs d'événements
  if (openModalButton) {
    openModalButton.addEventListener("click", openModalGallery);
    console.log("Modale ouverte, lancement de addphoto()");
  }

  // Fermer la modale au clic en dehors
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModalGallery();
    }
  });
});

// Fonction pour ouvrir une modale spécifique
function openModal(modalId) {
  const modal = document.querySelector(modalId);
  if (modal) {
    modal.classList.remove("hidden");
    modal.style.display = "flex";
  } else {
    console.error(`La modale avec l'ID ${modalId} n'existe pas.`);
  }
}

// Fonction pour fermer une modale spécifique
function closeModal(modalId) {
  const modal = document.querySelector(modalId);
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
  } else {
    console.error(`La modale avec l'ID ${modalId} n'existe pas.`);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM chargé, initialisation des modales...");
  // Bouton pour ouvrir la deuxième modale depuis la première
  const addPhotoButton = document.querySelector("#add-photo");

  if (addPhotoButton) {
    console.log("Bouton Ajouter une photo trouvé.");
    addPhotoButton.addEventListener("click", () => {
      closeModal("#gallery-modal"); // Ferme la première modale
      openModal("#photo-modal"); // Ouvre la deuxième modale
    });
  }
  

  // Boutons pour fermer la deuxième modale
  const closePhotoModalButton = document.querySelector(".close-photo-modal");
  if (closePhotoModalButton) {
    console.log("Bouton Fermer la modale photo trouvé.");
    closePhotoModalButton.addEventListener("click", () => {
      console.log("Bouton Fermer la modale photo cliqué.");
      closeModal("#photo-modal");
    });
  }
  // Ajout dynamique des catégories dans la deuxième modale
  const categorySelect = document.querySelector("#category");

  if (categorySelect) {
    console.log("Élément select pour les catégories trouvé.");
    try {
      const categories = await getCategories(); // Récupère les catégories via l'API
      if (categories && categories.length > 0) {
        // Utilisation d'un Set pour éviter les doublons
        console.log("Catégories récupérées :", categories);
        const uniqueCategoryNames = new Set();

        categories.forEach((category) => {
          if (!uniqueCategoryNames.has(category.name)) {
            uniqueCategoryNames.add(category.name);

            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option); // Ajoute chaque catégorie comme option
          }
        });

        console.log("Catégories uniques ajoutées au select avec succès.");
      } else {
        console.error("Aucune catégorie récupérée ou liste vide.");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout des catégories :", error);
    }
  } else {
    console.error("Élément select pour les catégories introuvable.");
  }
});

// Prévisualisation de l'image ajoutée
document.querySelector("#image").addEventListener("change", (event) => {
  const previewContainer = document.querySelector("#preview-container");
  const previewImage = document.querySelector("#image-preview");

  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result; // Récupère l'URL de l'image
      previewImage.style.display = "block"; // Affiche l'image
    };
    reader.readAsDataURL(file); // Lit le fichier comme une URL
  } else {
    // Si aucun fichier sélectionné
    previewImage.style.display = "none";
    previewImage.src = "";
  }
});

// Déclare toutes tes fonctions principales
function addphoto() {
  // déclarer la fonction
  console.log("Fonction addphoto appelée"); // Vérifie si la fonction est exécutée

  const form = document.querySelector("#add-project-form"); // Sélectionne le formulaire
  if (!form) {
    console.error("Le formulaire n'est pas trouvé !");
    return; // Arrête la fonction ici
  }

  console.log("Formulaire trouvé :", form); // Affiche le formulaire trouvé

  // Sélecteurs des messages d'erreur
  const titleErrorMessage = document.querySelector("#title-photo-modal + .error-message");
  const categoryErrorMessage = document.querySelector(".field-field-category .error-message");
  const photoErrorMessage = document.querySelector(".icon-and-photo-container .error-message");

  console.log("Titre Error Message trouvé :", titleErrorMessage);
  console.log("Catégorie Error Message trouvé :", categoryErrorMessage);
  console.log("Photo Error Message trouvé :", photoErrorMessage);


  // Fonction pour mettre à jour l'état du bouton "Valider"
  function updateSubmitButtonState() {
    const titleField = document.querySelector("#title-photo-modal");
    const categoryField = document.querySelector("#category");
    const imageField = document.querySelector("#image");
    const submitButton = document.querySelector("#submit-photo");

    // Vérifie si tous les champs sont remplis
    const isTitleFilled = titleField.value.trim() !== "";
    const isCategorySelected = categoryField.value !== "";
    const isImageAdded = imageField.files.length > 0;

    // Active/désactive le bouton en fonction des champs remplis
    if (isTitleFilled && isCategorySelected && isImageAdded) {
      submitButton.disabled = false;
      submitButton.style.backgroundColor = "#1d6154"; // Passe au vert
    } else {
      submitButton.disabled = true;
      submitButton.style.backgroundColor = "#a7a7a7"; // Reste grisé
    }
  }

  // Cache initialement les messages d'erreur
  titleErrorMessage.style.display = "none";
  categoryErrorMessage.style.display = "none";
  photoErrorMessage.style.display = "none";

  // Ajoute des écouteurs pour surveiller les champs
  document.querySelector("#title-photo-modal").addEventListener("input", updateSubmitButtonState);
  document.querySelector("#category").addEventListener("change", updateSubmitButtonState);
  document.querySelector("#image").addEventListener("change", updateSubmitButtonState);

  // Appelle une première fois pour initialiser l'état du bouton
  updateSubmitButtonState();

  //  écouteur d'événements pour le formulaire
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Empêche le comportement par défaut
    console.log("Formulaire soumis !"); // Ajoute cette ligne pour vérifier que le formulaire est soumis

    // Sélecteurs des champs
    const titleField = document.querySelector("#title-photo-modal");
    const categoryField = document.querySelector("#category");
    const imageField = document.querySelector("#image");
    const submitButton = document.querySelector("#submit-photo");

    console.log("Bouton Valider :", submitButton);
    //const errorMessage = imageField.closest(".icon-and-photo-container").querySelector(".error-message");

    // Sélecteurs des messages d'erreur
    const titleErrorMessage = document.querySelector("#title-photo-modal + .error-message");
    const categoryErrorMessage = document.querySelector(".field-field-category .error-message");
    const photoErrorMessage = document.querySelector(".icon-and-photo-container .error-message");

    // Vérifie si les messages d'erreur sont trouvés
    console.log("Titre Error Message :", titleErrorMessage);
    console.log("Catégorie Error Message :", categoryErrorMessage);
    console.log("Photo Error Message :", photoErrorMessage);

    let isValid = true; // Initialise la validation à true

    // Vérifier le champ Titre
    //const titleErrorMessage = document.querySelector("#title-photo-modal + .error-message");
      console.log("Titre :", titleField.value.trim());
      if (!titleField.value.trim()) {
      titleErrorMessage.style.display = "block";
      console.log("Erreur : Le titre est obligatoire.");
      isValid = false;
    } else {
      titleErrorMessage.style.display = "none";
    }

    // Vérifier la catégorie
    //const categoryErrorMessage = document.querySelector(".field-field-category .error-message");
    console.log("Catégorie sélectionnée :", categoryField.value);
    if (!categoryField.value) {
      categoryErrorMessage.style.display = "block";
      console.log("Erreur : Vous devez sélectionner une catégorie.");
      isValid = false;
    } else {
      categoryErrorMessage.style.display = "none";
    }



    // Vérifier l'ajout de photo
    //const photoErrorMessage = document.querySelector(".icon-and-photo-container .error-message");
    console.log("Nombre de fichiers ajoutés :", imageField.files.length);
    if (!imageField.files.length) {
      photoErrorMessage.style.display = "block";
      console.log("Erreur : Vous devez ajouter une photo.");
      isValid = false;
    } else {
      photoErrorMessage.style.display = "none";
    }

    // Si le formulaire n'est pas valide, on stoppe ici
    if (!isValid) {
      console.log("Validation échouée !");
      return;
      
    }

    console.log("Nombre de fichiers ajoutés :", imageField.files.length);

     // Si le formulaire est valide
      console.log("Formulaire validé !");
    

    // Récupère les données du formulaire
    const formData = new FormData(form); // Récupère les données du formulaire
    console.log("données du formulaire:", [...formData.entries()]); // Ajoute cette ligne pour afficher les données soumises.

    // Récupère le token pour l'authentification
    const token = localStorage.getItem("authToken"); // Récupère le token

    try {
      // Ajoute un bloc try...catch pour gérer les erreurs
      // Envoie les données au serveur
      const response = await fetch("http://localhost:5678/api/works", {
        // Envoie les données au serveur
        method: "POST", // Utilise la méthode POST
        headers: {
          // Ajoute les headers
          Authorization: `Bearer ${token}`, // Ajoute le token d'authentification
        },
        body: formData, // Contient l'image et les autres champs
      });

      console.log(response); // Affiche la réponse

      
      if (response.ok) {
        // Si la réponse est ok
        const newWork = await response.json(); // Récupère le travail ajouté
        console.log("Travail ajouté :", newWork); // Affiche le travail ajouté

        // Ajoute le travail à la galerie
        addWorkToGallery(newWork);
        closeModal("#photo-modal"); // Ferme la modale
        showWorks(); // Recharge les catégories et les travaux
      } else {
        // Si la réponse n'est pas ok
        console.error(`Erreur lors de l'ajout : ${response.status}`); // Affiche le statut de la réponse
        // Crée un message d'erreur visible dans le formulaire
        const errorBox = document.createElement("div");
        errorBox.className = "error-login";
        errorBox.textContent = `Erreur ${response.status} : Impossible d'ajouter la photo.`;
      
  // Ajoute ce message en haut du formulaire
  const form = document.querySelector("#add-project-form");
  form.prepend(errorBox);
      }
    } catch (error) {
      // Si une erreur se produit
      console.error("Erreur lors de l'envoi des données", error); // Affiche l'erreur
    }
  });
}

// Fonction pour ajouter un travail à la galerie
function addWorkToGallery(work) {
  const gallery = document.querySelector(".gallery"); // Sélectionne la galerie
  if (!gallery) {
    console.error("Galerie introuvable !");
    return; // Arrête la fonction ici pour éviter les erreurs
  }

  // Vérifie si l'image existe déjà dans la galerie
  const existingImages = Array.from(gallery.querySelectorAll("img")); // Sélectionne toutes les images
  const isDuplicate = existingImages.some((img) => img.src === work.imageUrl);

  // Vérifie si l'image est déjà présente
  if (isDuplicate) {
    console.warn("Image déjà existante dans la galerie :", work.imageUrl);
    return;
  }

  // Crée un élément figure pour le travail
  const figure = document.createElement("figure"); // Crée une figure

  const img = document.createElement("img"); // Crée une image
  img.src = work.imageUrl; // Récupère l'URL de l'image
  img.alt = work.title; // Récupère le titre du travail

  const figcaption = document.createElement("figcaption"); // Crée une légende
  figcaption.textContent = work.title; // Récupère le titre du travail

  // Ajoute l'image et la légende à la figure
  figure.appendChild(img); // Ajoute l'image à la figure
  figure.appendChild(figcaption); // Ajoute la légende à la figure

  // Ajoute la figure à la galerie
  gallery.appendChild(figure);

  console.log("Travail ajouté :", work.title);
}

addphoto(); // Appel de la fonction pour ajouter un travail




