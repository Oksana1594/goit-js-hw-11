import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { refs } from './js/refs';
import { createMarkup } from './js/createMarkup';
import { PixabayAPI } from './js/API';

let page = 1;
const pixabayApi = new PixabayAPI();

refs.loadMoreBtn.setAttribute('disabled', true);

refs.searchForm.addEventListener('submit', onSubmit);
refs.loadMoreBtn.addEventListener('click', onShowMore);

async function onSubmit(e) {
  e.preventDefault();

  const {
    elements: { searchQuery },
  } = e.currentTarget;

  const searchQueryValue = searchQuery.value.trim().toLowerCase();

  if (!searchQueryValue) {
    Notify.failure('What would you like to see?');
    return;
  }
  page = 1;

  pixabayApi.query = searchQueryValue;

  try {
    const data = await pixabayApi.getImagesByQuery(page);

    if (data.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    if (data.hits.length > 6) {
      Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }

    const markup = createMarkup(data.hits);
    refs.imagesGallery.innerHTML = markup;

    lightbox.refresh();

    if (page < Math.ceil(data.totalHits / 40)) {
      refs.loadMoreBtn.removeAttribute('disabled');
    }
    if (page >= Math.ceil(data.totalHits / 40)) {
      refs.loadMoreBtn.setAttribute('disabled', true);
    }
    refs.searchForm.reset();
  } catch (error) {
    Notify.failure(error.message);
  }
}

async function onShowMore(e) {
  page += 1;

  try {
    const data = await pixabayApi.getImagesByQuery(page);
    lightbox.refresh();

    const markup = createMarkup(data.hits);
    refs.imagesGallery.insertAdjacentHTML('beforeend', markup);
    page += 1;

    const totalPage = (await data.totalHits) / 40;
    if (page >= totalPage) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      refs.loadMoreBtn.setAttribute('disabled', true);
    }
  } catch (error) {
    Notify.failure(error.message);
  }
}

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});
