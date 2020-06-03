import React from 'react';
import {Result, Button} from 'antd';
import {Link} from "react-router-dom";

export default function ErrorScreen() {
    return (
        <div>
            <Result
                status="500"
                title="Error 500"
                subTitle="Sorry, something went wrong."
                extra={
                    <Button className="rounded" type="primary">
                        <Link to={"/"}>
                            Back Home
                        </Link>
                    </Button>}
            />
        </div>
    )
}