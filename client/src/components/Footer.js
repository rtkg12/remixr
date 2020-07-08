import React from 'react';
import ReactGA from "react-ga";

function Footer() {
    return (
        <footer>
                <span>
                <a
                    href="https://www.linkedin.com/in/ritik-goyal/"
                    style={{color: "#0E1D1A"}}
                    onClick={() => {
                        ReactGA.event({
                            category: "About",
                            action: "Linkedin",
                        });
                    }}
                >
                    &#169; Ritik Goyal
                </a>
            </span>

            <span>
                <a href="https://www.github.com/rtkg12/remixr" style={{color: "#0E1D1A", paddingRight: "1em"}}
                   onClick={() => {
                       ReactGA.event({
                           category: "About",
                           action: "Github",
                       });
                   }}
                >
                    Github
                </a>

                <a href="mailto:rtkg12@gmail.com?subject=remixr Feedback" style={{color: "#0E1D1A"}}
                   onClick={() => {
                       ReactGA.event({
                           category: "About",
                           action: "Feedback",
                       });
                   }}
                >
                    Send Feedback
                </a>
            </span>
        </footer>
    );
}

export default Footer;