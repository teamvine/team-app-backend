module.exports = {
    EMAIL_VERIFICATION_TEMPLATE: `<!DOCTYPE html>
    <html>
    
    <head>
        <link rel="stylesheet" type="text/css"
            href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    </head>
    <style type="text/css">
        html,
        body {
            height: 100%;
            width: 100%;
        }
    
        body {
            margin: 0px;
            background-color: #F3F3F3;
        }
    
        table {
            border: none;
            font-family: Arial, Helvetica, sans-serif;
        }
    
        .table-parent {
            margin: auto;
            padding: 30px;
            /* background-color: #F3F3F3; */
            /* border: 1px solid #5e6ce7; */
            width: 50%;
            margin-top: 4%;
        }
    
        .p-cont {
            text-align: left;
            padding: 3% 8%;
            font-weight: 600;
            color: rgb(0, 0, 0, 0.9);
            line-height: 23px;
        }
    
        .code {
            color: crimson;
        }
    
        .social-btns a {
            margin: 0 1.5%;
        }
    
        .social-btns a svg {
            background: #4253ee;
            padding: 5px;
            border-radius: 6px;
        }
    
        .social-btns a svg:hover {
            background: #202c9c;
            padding: 5px;
            border-radius: 6px;
        }
    </style>
    
    <body>
        <table class="table-parent">
            <tr>
                <td>
                    <table width="100%">
                        <tr>
                            <td>
                                <h1>RCONNECT</h1>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>
                    <table cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
                        <tr>
                            <td style="background-color:#337eee;height:90px;">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path fill="white"
                                        d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm17 4.238l-7.928 7.1L4 7.216V19h16V7.238zM4.511 5l7.55 6.662L19.502 5H4.511z" />
                                    </svg>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1 style="padding-top:25px;">Email Confirmation</h1>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div class="form">
                                    <p>The verification code: <b class="code">VERIFICATION_CODE</b>. </p>
                                    <p class="p-cont">
                                        Hi USER_FULL_NAME, you registered an account on RCONNECT. Before being able to use your account you
                                        need to verify
                                        that this is really your email. We thank you for choosing RCONNECT. With your team,
                                        we help you
                                        to accomplish all your goals.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td>
                    <table width="100%" style="border-radius: 5px;text-align: center;">
                        <tr>
                            <td>
                                <h3 style="margin-top:10px;">Stay in touch</h3>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div style="margin-top:20px;" class="social-btns">
                                    <a href="www.twitter.com" style="text-decoration: none;">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                            <path fill="none" d="M0 0h24v24H0z" />
                                            <path fill="white"
                                                d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z" />
                                            </svg>
                                    </a>
                                    <a href="https://www.facebook.com/pages/creation/?ref_type=launch_point"
                                        style="text-decoration: none;">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                            <path fill="none" d="M0 0h24v24H0z" />
                                            <path fill="white"
                                                d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
                                            </svg>
                                    </a>
                                    <a href="rconnect250@gmail.com" style="text-decoration: none;">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                            <path fill="none" d="M0 0h24v24H0z" />
                                            <path fill="white"
                                                d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0-2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.25a1.25 1.25 0 0 1-2.5 0 1.25 1.25 0 0 1 2.5 0zM12 4c-2.474 0-2.878.007-4.029.058-.784.037-1.31.142-1.798.332-.434.168-.747.369-1.08.703a2.89 2.89 0 0 0-.704 1.08c-.19.49-.295 1.015-.331 1.798C4.006 9.075 4 9.461 4 12c0 2.474.007 2.878.058 4.029.037.783.142 1.31.331 1.797.17.435.37.748.702 1.08.337.336.65.537 1.08.703.494.191 1.02.297 1.8.333C9.075 19.994 9.461 20 12 20c2.474 0 2.878-.007 4.029-.058.782-.037 1.309-.142 1.797-.331.433-.169.748-.37 1.08-.702.337-.337.538-.65.704-1.08.19-.493.296-1.02.332-1.8.052-1.104.058-1.49.058-4.029 0-2.474-.007-2.878-.058-4.029-.037-.782-.142-1.31-.332-1.798a2.911 2.911 0 0 0-.703-1.08 2.884 2.884 0 0 0-1.08-.704c-.49-.19-1.016-.295-1.798-.331C14.925 4.006 14.539 4 12 4zm0-2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z" />
                                            </svg>
                                    </a>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div style="margin-top: 20px;">
                                    <small>Copyright &copy;rconnect</small>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    
    </html>
    `
}