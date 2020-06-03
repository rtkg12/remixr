import React from 'react';

function Footer() {
    return (
        <footer>
                <span>
                <a href="https://www.linkedin.com/in/ritik-goyal/" style={{color: "#0E1D1A"}}>
                    &#169; Ritik Goyal
                </a>
            </span>

            <span>
                <a href="https://www.github.com/rtkg12/remixr" style={{color: "#0E1D1A", paddingRight: "1em"}}>
                    Github
                </a>

                <a href="mailto:rtkg12@gmail.com?subject=remixr Feedback" style={{color: "#0E1D1A"}}>
                    Send Feedback
                </a>
            </span>
        </footer>
    );
}

export default Footer;