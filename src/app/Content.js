import React, { Suspense } from "react";
import { Switch, Route, Redirect, withRouter } from "react-router-dom";

import "./Content.css";

import Explorer from "./views/Explorer";
import Loading from "./views/Loading";

import NotFound from "./views/errors/NotFound";
import ServerError from "./views/errors/ServerError";

import { validateAddress, validateBlockHash } from "lib/util";

const NodeStatus = React.lazy(() => import("./views/NodeStatus"));
const NetworkStatus = React.lazy(() => import("./views/NetworkStatus"));
const ExplorerAccount = React.lazy(() => import("./views/explorer/Account"));
const ExplorerBlock = React.lazy(() => import("./views/explorer/Block"));
const Accounts = React.lazy(() => import("./views/explorer/Accounts"));

class Content extends React.Component {
  state = {
    hasError: false
  };

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.setState({ hasError: false });
    }
  }

  determineQueryDestination(search) {
    if (validateAddress(search)) {
      return `/account/${search}`;
    } else if (validateBlockHash(search)) {
      return `/block/${search}`;
    } else {
      return "/not_found";
    }
  }

  render() {
    if (this.state.hasError) {
      return <ServerError />;
    }

    return (
      <div id="Content">
        <Suspense fallback={<Loading />}>
          <Switch>
            <Route exact path="/" render={props => <Explorer {...props} />} />
            <Route
              path="/auto/:query"
              render={props => (
                <Redirect
                  to={this.determineQueryDestination(props.match.params.query)}
                />
              )}
            />

            <Route
              exact
              path="/account/:account"
              render={props => (
                <Redirect
                  to={`/account/${props.match.params.account}/history`}
                />
              )}
            />
            <Route
              path="/account/:account/:page"
              render={({ match, history, ...props }) => (
                <ExplorerAccount
                  key={match.params.account}
                  account={match.params.account}
                  match={match}
                  browserHistory={history}
                  {...props}
                />
              )}
            />

            <Route
              path="/block/:block"
              render={props => <ExplorerBlock {...props} />}
            />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </div>
    );
  }
}

export default withRouter(Content);
