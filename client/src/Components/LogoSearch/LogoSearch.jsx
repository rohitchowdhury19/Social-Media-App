import React, { useEffect, useState } from 'react'
import Logo from '../../Img/logo.png';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { getAllUser } from '../../api/UserRequest';
import publicFolder from '../../utils/publicFolder';
import { cn } from '../../utils/clsx';

const LogoSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await getAllUser();
      setUsers(data);
    };

    fetchUsers();
  }, []);

  const matches = query.trim()
    ? users.filter((user) => `${user.firstname} ${user.lastname}`.toLowerCase().includes(query.toLowerCase()))
    : [];

  const openProfile = (userId) => {
    setQuery('');
    setShowResults(false);
    navigate(`/profile/${userId}`);
  };

  const handleSearch = () => {
    if (matches.length > 0) {
      openProfile(matches[0]._id);
    } else if (query.trim()) {
      window.alert('No user found');
    }
  };

  return (
    <div className={cn('flex gap-3 relative items-start z-[5]')}>

      <img src={Logo} alt="" className="w-16 h-16 object-contain shrink-0" />

      <div className={cn('flex bg-inputColor rounded-[10px] p-[5px] relative min-w-[12rem]')}>
        <input
          type="text"
          placeholder='Search users'
          className="bg-transparent border-0 outline-none flex-1 min-w-0"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />

        <div
          className={cn('flex items-center justify-center bg-search-gradient rounded-[5px] p-1 text-white cursor-pointer')}
          onClick={handleSearch}
        >
          <SearchIcon />
        </div>

        {showResults && matches.length > 0 && (
          <div className={cn('absolute top-[calc(100%+0.4rem)] left-0 right-0 bg-white rounded-[0.6rem] shadow-dropdown overflow-hidden z-20')}>
            {matches.slice(0, 5).map((person) => (
              <div
                className={cn('flex items-center gap-[0.6rem] p-[0.55rem] cursor-pointer hover:bg-inputColor')}
                key={person._id}
                onClick={() => openProfile(person._id)}
              >
                <img
                  src={person.profilePicture ? publicFolder + person.profilePicture : publicFolder + 'defaultProfile.png'}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span>{person.firstname} {person.lastname}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default LogoSearch
