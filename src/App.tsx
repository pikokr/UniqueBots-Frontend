import * as React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import HomePage from "./views/Home/index";
import {createMuiTheme, CssBaseline, MuiThemeProvider} from "@material-ui/core";
import Oauth2Callback from "./views/Oauth2Callback";
import NotFound from "./views/NotFound";
// import AdminPage from "./views/Admin";
import ManageBots from "./views/Admin/Bots";
import Judges from "./views/Admin/Judges";
import AddBotPage from "./views/AddBot";
import LayoutProvider from "./components/LayoutProvider";
import BotInfo from "./views/Bot";
import ProfileView from "./views/Profille";
import Users from "./views/Admin/Users";
import Audits from "./views/Admin/Audits";
import {AnimatePresence} from "framer-motion";
import AnimateView from "./util/animateView";
import ManagePanel from "./views/ManagePanel";
import ManageBot from "./views/ManagePanel/Bot";
import Discord from "./views/Discord";
import ExperimentsMenu from "./components/ExperimentsMenu";
import {hot} from "react-hot-loader";

declare const module: any

const theme = createMuiTheme({
    palette: {
        type: 'dark'
    }
})

class App extends React.Component {
    render() {
        return (
            <MuiThemeProvider theme={theme}>
                <CssBaseline/>
                <ExperimentsMenu/>
                <BrowserRouter>
                    <LayoutProvider>
                        <Route render={({location}) => (
                            <AnimatePresence exitBeforeEnter initial={true}>
                                <Switch location={location} key={location.pathname}>
                                    <Route exact path="/" component={AnimateView(HomePage)}/>
                                    {/*@ts-ignore*/}
                                    <Route exact path="/callback/auth" component={AnimateView(Oauth2Callback)}/>
                                    {/*<Route exact path="/admin" component={AnimateView(AdminPage)}/>*/}
                                    <Route exact path="/admin/bots" component={AnimateView(ManageBots)}/>
                                    <Route exact path="/admin/judges" component={AnimateView(Judges)}/>
                                    <Route exact path="/admin/users" component={AnimateView(Users)}/>
                                    <Route exact path="/admin/audits" component={AnimateView(Audits)}/>
                                    <Route exact path="/addbot" component={AnimateView(AddBotPage)}/>
                                    <Route exact path="/bots/:id" component={AnimateView(BotInfo)}/>
                                    <Route exact path="/user/:id" component={AnimateView(ProfileView)}/>
                                    <Route exact path="/manage" component={AnimateView(ManagePanel)}/>
                                    <Route exact path="/manage/bot/:id" component={AnimateView(ManageBot)}/>
                                    <Route exact path="/discord" component={AnimateView(Discord)} />
                                    <Route component={AnimateView(NotFound)}/>
                                </Switch>
                            </AnimatePresence>
                        )}/>
                    </LayoutProvider>
                </BrowserRouter>
            </MuiThemeProvider>
        );
    }
}

export default hot(module)(App)
