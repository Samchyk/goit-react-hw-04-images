import ImageGallery from 'components/ImageGallery/ImageGallery';
import Searchbar from 'components/Searchbar/Searchbar';
import { useState, useEffect } from 'react';
import SearchApi from 'services/Api';
import Notiflix from 'notiflix';
import Button from 'components/Button/Button';
import Modal from 'components/Modal/Modal';
import Loader from 'components/Loader/Loader';
import * as Scroll from 'react-scroll';

export default function App() {
   const [searchName, setSearchName] = useState('');
   const [page, setPage] = useState(1);
   const [perPage] = useState(12);
   const [images, setImages] = useState([]);
   const [loading, setLoading] = useState(false);
   const [showLoadMore, setShowLoadMore] = useState(false);
   const [modal, setModal] = useState({ url: '', alt: '' });
   Notiflix.Notify.init({
      position: 'left-top',
   });

   useEffect(() => {
      if (!searchName) {
         return;
      }
      setShowLoadMore(false);
      setLoading(true);
      SearchApi(searchName, page, perPage)
         .then(date => {
            const filterDataHits = date.hits.map(img => {
               return Object.fromEntries(
                  Object.entries(img).filter(([key]) =>
                     ['id', 'tags', 'largeImageURL', 'webformatURL'].includes(
                        key
                     )
                  )
               );
            });
            setImages(prev => [...prev, ...filterDataHits]);
            setLoading(false);
            if (date.total !== date.hits.length) {
               setShowLoadMore(true);
            }
            if (page === 1) {
               Notiflix.Notify.success(
                  `Hooray! We found ${date.totalHits} images.`
               );
            }
            if (date.total <= page * perPage) {
               setShowLoadMore(false);
               Notiflix.Notify.info(
                  "We're sorry, but you've reached the end of search results."
               );
            }
         })
         .catch(onApiError);
   }, [page, searchName, perPage]);

   const onApiError = () => {
      Notiflix.Notify.failure(
         'Sorry, there are no images matching your search query. Please try again.'
      );
      setShowLoadMore(false);
      setLoading(false);
   };

   const onSubmit = (name, per) => {
      if (!name) {
         Notiflix.Notify.failure('Please. Enter the name of the picture.');
         setShowLoadMore(false);
      }
      if (searchName === name && page === 1 && per === perPage) {
         return;
      }
      setSearchName(name);
      perPage(per);
      setPage(1);
      setImages([]);
   };

   const onloadeMore = () => {
      setPage(prev => prev + 1);
      scrollSlowly();
   };

   const scrollSlowly = () => {
      const { height: cardHeight } = document
         .querySelector('#ImageGallery')
         .firstElementChild.getBoundingClientRect();
      Scroll.animateScroll.scrollMore(cardHeight * 2);
   };

   const openModal = (url, alt) => {
      setModal({ url, alt });
      setTimeout(() => {
         setModal.url(true);
      }, 100);
   };

   return (
      <div className="App">
         <Searchbar onSubmit={onSubmit} />
         {modal.ulr && (
            <Modal
               url={modal.url}
               alt={modal.alt}
               onClose={() => setModal.url(false)}
            />
         )}
         <ImageGallery images={images} openModal={openModal} />
         {loading && <Loader />}
         {showLoadMore && <Button onClick={onloadeMore} title="Load more" />}
      </div>
   );
}
