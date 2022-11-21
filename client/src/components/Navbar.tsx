import React, { useState } from 'react';
import { Affix } from 'antd';
import { Redirect } from 'react-router-dom';
import NavButton from './NavButton';

const Navbar = () => {
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  return (
    <Affix offsetTop={0}>
      {redirectPath ? (
        <Redirect to={redirectPath} />
      ) : (
        <div className="navbar">
          <a
            style={{
              fontFamily: "'Abril Fatface', cursive",
              fontSize: '2.5em',
              color: '#262626',
              float: 'left',
              border: 'none',
              padding: 0,
            }}
            onClick={() => setRedirectPath('/')}
          >
            remixr
          </a>
          <NavButton />
        </div>
      )}
    </Affix>
  );
};

export default Navbar;
