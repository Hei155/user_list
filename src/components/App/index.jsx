import { useState } from "react";
import { debounce } from "../../helpers/debounce";
import './styles.css';

function App() {
  const [userList, setUserList] = useState([]);

  const [pending, setPending] = useState(false);

  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [error, setError] = useState('');

  const getData = async (currentSearch, page) => {
    setPending(true);
    try {
      const res = await fetch(`https://api.github.com/search/users?q=${currentSearch}&page=${page}`);
      if (res.status === 403) throw new Error ('Request limit');
      const list = await res.json();

      setPending(false);
    
      if (list.items) {
        setUserList(list.items);
        setTotalPages(Math.ceil(list.total_count / list.items.length))
        setPage(page);
        setSearch(currentSearch);
      } else {
        setUserList([]);
      }

      setError('');
    
    } catch (e) {
      setPending(false);
      setError(e.message);
    }
  }

  const debouncedHandleChange = debounce(getData, 1000);

  return (
    <div className="App">
        <div>
            <input className="search" placeholder="Search users" type="text" onChange={(e) => debouncedHandleChange(e.target.value, 1)}/>
        </div>
        <div>
            {error && <h1>{error}</h1>}
        </div>
        {pending ? 
        <h1>Loading...</h1> 
        :
        <>  
            <div className="user">
                {userList.length > 0 && userList.map((user) => (
                <div key={user.id}>
                    <img className="user__avatar" loading="lazy" alt={user.login} src={user.avatar_url}/>
                    <span>{user.login}</span>
                </div>
                ))}
            </div>
            {userList.length > 0 && 
            <div className="pagination">
                <button className="pagination__btn" disabled={page === 1 || pending} onClick={() => getData(search, page - 1)}>Previous</button>
                <button className="pagination__btn" disabled={page === totalPages || pending} onClick={() => getData(search, page + 1)}>Next</button>
            </div>
            }
        </>
        }
    </div>
  );
}

export default App;
