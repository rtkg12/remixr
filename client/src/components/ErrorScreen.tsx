import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';
import ReactGA from 'react-ga';

const ErrorScreen = () => {
  ReactGA.event({
    category: 'Error',
    action: 'Error screen displayed',
  });

  return (
    <div>
      <Result
        status="500"
        title="Error 500"
        subTitle="Sorry, something went wrong."
        extra={
          <Button className="rounded" type="primary">
            <Link to={'/'}>Back Home</Link>
          </Button>
        }
      />
    </div>
  );
}

export default ErrorScreen;