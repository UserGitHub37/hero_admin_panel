import { useHttp } from '../../hooks/http.hook';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { heroesFetching, heroesFetched, heroesFetchingError, heroDeleted } from '../../actions';
import HeroesListItem from "../heroesListItem/HeroesListItem";
import Spinner from '../spinner/Spinner';

// Задача для этого компонента:
// При клике на "крестик" идет удаление персонажа из общего состояния
// Усложненная задача:
// Удаление идет и с json файла при помощи метода DELETE

const HeroesList = () => {
  const filteredHeroesSelector = createSelector(
    (state) => state.filters.activeFilter,
    (state) => state.heroes.heroes,
    (filter, heroes) => {
      if (filter === 'all') {
        return heroes;
      } else {
        return heroes.filter(item => item.element === filter)
      }
    }
  );

  const filteredHeroes = useSelector(filteredHeroesSelector);
  // Код ниже вызывает повторный рендеринг,
  // например если несколько раз кликнуть по одной и той-же кнопке,
  // значение возвращаемое useSelector будет то-же,
  // но при этом будет перерендеринг компонента.
  // Поэтому для мемоизации надо использовать createSelector.
  // const filteredHeroes = useSelector(state => {
  //   if (state.filters.activeFilter === 'all') {
  //     console.log('render in selector');
  //     return state.heroes.heroes;
  //   } else {
  //     console.log('render in selector');
  //     return state.heroes.heroes.filter(item => item.element === state.filters.activeFilter)
  //   }
  // });
  const heroesLoadingStatus = useSelector(state => state.heroes.heroesLoadingStatus);
  const dispatch = useDispatch();
  const { request } = useHttp();

  useEffect(() => {
    dispatch(heroesFetching());
    request("http://localhost:3001/heroes")
      .then(data => dispatch(heroesFetched(data)))
      .catch(() => dispatch(heroesFetchingError()))
    // eslint-disable-next-line
  }, []);

  const onDelete = useCallback((id) => {
    request(`http://localhost:3001/heroes/${id}`, "DELETE")
      .then(data => console.log(data, "The hero has been removed"))
      .then(() => dispatch(heroDeleted(id)))
      .catch(err => console.log(err));
    // eslint-disable-next-line
  }, [request])

  if (heroesLoadingStatus === "loading") {
    return <Spinner />;
  } else if (heroesLoadingStatus === "error") {
    return <h5 className="text-center mt-5">Ошибка загрузки</h5>
  }

  const renderHeroesList = (arr) => {
    if (arr.length === 0) {
      return <h5 className="text-center mt-5">Героев пока нет</h5>
    }

    return arr.map(({ id, ...props }) => {
      return <HeroesListItem key={id} {...props} onDelete={() => onDelete(id)} />
    })
  }

  const elements = renderHeroesList(filteredHeroes);
  return (
    <ul>
      {elements}
    </ul>
  )
}

export default HeroesList;
