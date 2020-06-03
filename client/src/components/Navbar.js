import React, {useState} from 'react';
import {Affix, Button} from "antd";
import Cookies from 'js-cookie';
import {Redirect} from "react-router-dom";

const Navbar = () => {
    const [redirectPath, setRedirectPath] = useState(null);

    const logout = () => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        setRedirectPath("/");
    }

    return (
        <Affix offsetTop={0}>
            {redirectPath ?
                <Redirect to={redirectPath}/> :
                <div className="navbar">
                    <Button
                        style={{
                            float: "left",
                            border: "none",
                            padding: 0,
                        }}
                        type="text"
                        onClick={() => setRedirectPath("/")}
                    >
                        <span style={{
                            fontFamily: "'Abril Fatface', cursive",
                            fontSize: "2.5em",
                            color: "#262626"
                        }}>
                            remixr
                        </span>
                    </Button>
                    <Button
                        shape="round"
                        size="large"
                        style={{
                            float: "right",
                            marginTop: "0.5em",
                            background: "#68EB64",
                            borderColor: "#68EB64",
                            color: "#262626"
                        }}
                        onClick={logout}
                    >
                        Log out
                    </Button>
                </div>
            }
        </Affix>
    );
};

export default Navbar;
