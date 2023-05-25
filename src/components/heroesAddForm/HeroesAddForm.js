import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuid } from 'uuid';
import { useHttp } from '../../hooks/http.hook';
import { heroCreated } from '../../actions';
import { useSelector } from 'react-redux';

// Задача для этого компонента:
// Реализовать создание нового героя с введенными данными. Он должен попадать
// в общее состояние и отображаться в списке + фильтроваться
// Уникальный идентификатор персонажа можно сгенерировать через uuid
// Усложненная задача:
// Персонаж создается и в файле json при помощи метода POST
// Дополнительно:
// Элементы <option></option> желательно сформировать на базе
// данных из фильтров

const HeroesAddForm = () => {
  const [heroName, setHeroName] = useState('');
  const [heroDescr, setHeroDescr] = useState('');
  const [heroElement, setHeroElement] = useState('');

  const { filters, filtersLoadingStatus } = useSelector(state => state.filters);
  const dispatch = useDispatch();
  const { request } = useHttp();

  const onSubmitHandler = (e) => {
    e.preventDefault();
    const newHero = {
      id: uuid(),
      name: heroName,
      description: heroDescr,
      element: heroElement
    }

    request("http://localhost:3001/heroes", "POST", JSON.stringify(newHero))
      .then(res => console.log(res, 'Hero added'))
      .then(() => {
        dispatch(heroCreated(newHero));
        setHeroName('');
        setHeroDescr('');
        setHeroElement('');
      })
      .catch(err => console.log(err))
  }

  const renderFilters = (filters, status) => {
    if (status === 'loading') {
      return <option>Загрузка элементов</option>
    } else if (status === 'error') {
      return <option>Ошибка загрузки</option>
    }

    if (filters && filters.length > 0) {
      return filters.map(({name, label}) => {
        // eslint-disable-next-line
        if (name === 'all') return;

        return <option key={name} value={name}>{label}</option>
    })
    }

  }

  return (
    <form onSubmit={onSubmitHandler} className="border p-4 shadow-lg rounded">
      <div className="mb-3">
        <label htmlFor="name" className="form-label fs-4">Имя нового героя</label>
        <input
          value={heroName}
          onChange={e => setHeroName(e.target.value)}
          required
          type="text"
          name="name"
          className="form-control"
          id="name"
          placeholder="Как меня зовут?" />
      </div>

      <div className="mb-3">
        <label htmlFor="text" className="form-label fs-4">Описание</label>
        <textarea
          value={heroDescr}
          onChange={e => setHeroDescr(e.target.value)}
          required
          name="text"
          className="form-control"
          id="text"
          placeholder="Что я умею?"
          style={{ "height": '130px' }} />
      </div>

      <div className="mb-3">
        <label htmlFor="element" className="form-label">Выбрать элемент героя</label>
        <select
          required
          value={heroElement}
          onChange={e => setHeroElement(e.target.value)}
          className="form-select"
          id="element"
          name="element">
          <option >Я владею элементом...</option>
          {renderFilters(filters, filtersLoadingStatus)}
        </select>
      </div>

      <button type="submit" className="btn btn-primary">Создать</button>
    </form>
  )
}

export default HeroesAddForm;
