const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    const nextOpenState = !isOpen;
    menuToggle.setAttribute('aria-expanded', String(nextOpenState));
    menuToggle.setAttribute('aria-label', nextOpenState ? 'Fermer le menu' : 'Ouvrir le menu');
    mainNav.classList.toggle('is-open', nextOpenState);
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
      mainNav.classList.remove('is-open');
    });
  });
}

document.querySelectorAll('.filter-button').forEach((button) => {
  button.addEventListener('click', () => {
    const selectedFilter = button.dataset.filter;

    document.querySelectorAll('.filter-button').forEach((filterButton) => {
      const isSelected = filterButton === button;
      filterButton.classList.toggle('is-active', isSelected);
      filterButton.setAttribute('aria-pressed', String(isSelected));
    });

    document.querySelectorAll('.portfolio-item').forEach((item) => {
      const categories = item.dataset.category ? item.dataset.category.split(' ') : [];
      item.hidden = selectedFilter !== 'all' && !categories.includes(selectedFilter);
    });
  });
});

const assistantToggle = document.querySelector('.assistant-toggle');
const assistantPanel = document.querySelector('.assistant-panel');
const assistantClose = document.querySelector('.assistant-close');

if (assistantToggle && assistantPanel) {
  function setAssistantOpen(isOpen) {
    assistantToggle.setAttribute('aria-expanded', String(isOpen));
    assistantPanel.hidden = !isOpen;
    if (isOpen && assistantClose) assistantClose.focus();
    else assistantToggle.focus();
  }

  assistantToggle.addEventListener('click', () => {
    setAssistantOpen(assistantToggle.getAttribute('aria-expanded') !== 'true');
  });

  if (assistantClose) {
    assistantClose.addEventListener('click', () => setAssistantOpen(false));
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !assistantPanel.hidden) setAssistantOpen(false);
  });
}

const yearNode = document.querySelector('#current-year');
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

document.querySelectorAll('.faq-question').forEach((button) => {
  button.addEventListener('click', () => {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    const answer = button.nextElementSibling;

    button.setAttribute('aria-expanded', String(!isExpanded));
    if (answer) {
      answer.hidden = isExpanded;
    }
  });
});

function getYouTubeVideoId(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  const supportedHosts = ['youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com'];
  if (!supportedHosts.includes(hostname)) return null;

  let videoId = null;
  if (hostname === 'youtu.be') {
    videoId = url.pathname.split('/').filter(Boolean)[0];
  } else if (url.pathname === '/watch') {
    videoId = url.searchParams.get('v');
  } else {
    videoId = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?#]+)/)?.[1] || null;
  }

  return videoId && /^[\w-]{11}$/.test(videoId) ? videoId : null;
}

const presentationVideo = window.iconeMediaPresentation;
const videoContainer = document.querySelector('#presentation-video');
if (presentationVideo && videoContainer) {
  const titleNode = document.querySelector('#video-title');
  const descriptionNode = document.querySelector('#video-description');
  if (titleNode) titleNode.textContent = presentationVideo.videoTitle;
  if (descriptionNode) descriptionNode.textContent = presentationVideo.videoDescription;

  const videoId = presentationVideo.videoEnabled
    ? getYouTubeVideoId(presentationVideo.youtubeUrl)
    : null;

  if (videoId) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
    iframe.title = presentationVideo.videoTitle;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    videoContainer.replaceChildren(iframe);
  } else if (!presentationVideo.videoEnabled) {
    const title = videoContainer.querySelector('.video-placeholder strong');
    if (title) title.textContent = 'Vidéo de présentation momentanément indisponible';
  } else if (presentationVideo.youtubeUrl && presentationVideo.videoEnabled) {
    const error = document.createElement('p');
    error.className = 'video-placeholder-error';
    error.textContent = 'L’URL de la vidéo est à vérifier. Veuillez utiliser un lien YouTube valide.';
    videoContainer.querySelector('.video-placeholder')?.append(error);
  }

  const coverUrl = presentationVideo.videoCover;
  const placeholder = videoContainer.querySelector('.video-placeholder');
  if (!videoId && coverUrl && placeholder) {
    try {
      const imageUrl = new URL(coverUrl, window.location.href);
      if (imageUrl.protocol === 'http:' || imageUrl.protocol === 'https:') {
        const image = document.createElement('img');
        image.className = 'video-placeholder-cover';
        image.src = imageUrl.href;
        image.alt = '';
        placeholder.prepend(image);
      }
    } catch {
      const error = document.createElement('p');
      error.className = 'video-placeholder-error';
      error.textContent = 'L’image de couverture est à vérifier.';
      placeholder.append(error);
    }
  }
}

const quoteForm = document.querySelector('#quote-form');
const formStatus = document.querySelector('#form-status');

if (quoteForm && formStatus) {
  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!quoteForm.reportValidity()) return;

    const data = new FormData(quoteForm);
    const fields = [
      ['Nom', 'name'],
      ['Entreprise', 'company'],
      ['Téléphone', 'phone'],
      ['WhatsApp', 'whatsapp'],
      ['Email', 'email'],
      ['Type de produit', 'product'],
      ['Quantité', 'quantity'],
      ['Format', 'format'],
      ['Support', 'support'],
      ['Finition', 'finish'],
      ['Date souhaitée', 'date'],
      ['Description', 'description'],
    ];
    const message = [
      'Bonjour Shalom INT, je viens du site ICONE MEDIA et je souhaite demander un devis.',
      ...fields
        .filter(([, name]) => String(data.get(name) || '').trim())
        .map(([label, name]) => `${label} : ${String(data.get(name)).trim()}`),
    ].join('\n');
    const file = data.get('file');
    const fileNote = file instanceof File && file.size > 0
      ? ` Le fichier « ${file.name} » n’est pas joint automatiquement : vous pourrez l’ajouter dans la conversation WhatsApp.`
      : '';

    formStatus.textContent = `Votre demande va s’ouvrir dans WhatsApp. Vérifiez le message puis appuyez sur Envoyer.${fileNote}`;
    window.open(`https://wa.me/22670038636?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });
}
