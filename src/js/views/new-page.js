import React from 'react';
import { Route, Switch } from 'react-router';
import {
  Grid,
  Message,
  Header,
  Segment,
  Button,
  Icon
} from 'semantic-ui-react';
import { get, linkToCurrentPage, showInfo } from '../romeo';
import deepHoc from '../components/deep-hoc';

class NewPage extends React.Component {
  constructor(props) {
    super(props);
    this.romeo = get();
    this.state = {
      adding: this.romeo.addingPage
    };
    this.addPage = this.addPage.bind(this);
  }

  shouldComponentUpdate (newProps, newState) {
    return newState.adding === true && this.state.adding !== newState.adding;
  }

  render() {
    const { adding } = this.state;
    const extraInfo = this.romeo.guard.opts.name === 'ledger'
       ? (
         <strong>
           <br/><br/>
           Since you are using ledger, the transfers from the old page will happen sequentially
           one-by-one. Hence, if you have several addresses with positive balance,
           you will have to confirm all the transfers from each ledger on your ledger one after another.
           <br/><br/>
         </strong>
      )
      : null;
    return (
      <span>
        <Grid>
          <Grid.Row>
            <Grid.Column computer={12} tablet={16}>
              <Header as="h2">Add a new page</Header>
              <Segment basic style={{ padding: 0 }} loading={adding}>
                <Message
                  info
                  icon="file"
                  header="As your current page gets bigger, create a new one!"
                  content={
                    <span>
                      Big pages sync slower. To make sure your ledger is updated
                      and loaded as fast as possible, it is a good idea to
                      create a new page once in a while. The process is
                      following:
                      <ol>
                        <li>
                          A new page seed is generated and attached to your
                          ledger.
                        </li>
                        <li>A new address is generated on the new page.</li>
                        <li>
                          The balance from the oldest page (if any) is
                          transferred to the new page's address.
                        </li>
                      </ol>
                      The whole process should not take more than a few minutes.
                      The old balance should be available to spend on the new
                      page within 5-10 minutes (as soon as the transaction is
                      confirmed).
                      {extraInfo}
                      <p>Are you ready?</p>
                      <center>
                        <Button
                          onClick={this.addPage}
                          color="olive"
                          size="large"
                          loading={adding}
                          disabled={adding}
                        >
                          Add a new page
                        </Button>
                      </center>
                    </span>
                  }
                />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </span>
    );
  }

  addPage() {
    const { history } = this.props;
    const romeo = get();

    this.setState({ adding: true }, () => {
      romeo.newPage({ preventRetries: romeo.guard.opts.name === 'ledger' })
        .then(() => {
          history.push(linkToCurrentPage());
          showInfo(
            <span>
            <Icon name="file" /> New page setup complete!
          </span>,
            6000,
            'success'
          );
        })
        .catch((err) => {
          console.log("ERROR ADDING PAGE!", err);
          showInfo(
            <span>
              <Icon name="clock" />
              There was an error moving the funds from the old page to the new one.
              The new page is probably created. You will have to move the funds
              manually from the old page. 😞 Sorry for that!
            </span>,
              300000,
              'error'
            );
        });
    });
    showInfo(
      <span>
        <Icon name="clock" />
        New page is being added! Please wait for the setup to complete. It can
        take up to a few minutes. You can continue using Romeo, but please do
        not close it. You will get another notification, once the setup is
        complete.
      </span>,
      15000,
      'warning'
    );
  }
}

export default deepHoc(NewPage);
