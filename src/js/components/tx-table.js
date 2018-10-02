import React from 'react';
import { withRouter } from 'react-router-dom';
import {
  Icon,
  Header,
  Button,
  Table,
  Label,
  Checkbox,
  Responsive,
  Divider,
  Card,
  Popup
} from 'semantic-ui-react';
import { copyData } from "./current-page-menu-item";
import deepHoc from './deep-hoc';
import { get } from '../romeo';
import { formatIOTAAmount } from '../utils';

class TXTable extends React.Component {
  constructor(props) {
    super(props);
    this.renderCard = this.renderCard.bind(this);
    this.openDetails = this.openDetails.bind(this);
    this.state = {
      hideZero: true
    };
    this.romeo = get();
  }
  render() {
    const { address, page } = this.props;
    const { hideZero } = this.state;
    let txs = (address
      ? Object.values(address.transactions)
      : Object.values(page.page.addresses)
          .map(a => Object.values(a.transactions))
          .reduce((t, i) => t.concat(i), [])
    ).filter(t => !hideZero || t.value !== 0);

    txs = txs.filter(t => t.persistence || !txs.filter(t2 => t2.persistence && t2.bundle === t.bundle).length);

    if (txs.length === 0) {
      return page.page.isSyncing ? this.renderLoading() : this.renderEmpty()
    }

    return this.renderCards(this._sortTXs(txs));
  }

  renderEmpty () {
    const { page } = this.props;
    const sync = () => {
      const pageObject = this.romeo.pages.getByIndex(page.page.index).page;
      !page.page.isSyncing && this.romeo.pages.syncPage(pageObject, true, 40);
    };
    return (
      <span>
        <br/><br/>
        <Header as='h2' icon color="grey" textAlign="center">
          <Icon name='user secret' />
          Psst! No transactions here, yet...
          <Header.Subheader>
            You might try to click on <a href={`${window.location.href}`} onClick={sync}>sync</a>, if you expect otherwise.
          </Header.Subheader>
        </Header>
      </span>
    )
  }

  renderLoading () {
    return (
      <span>
        <br/><br/>
        <Header as='h2' icon color="grey" textAlign="center">
          <Icon name='blind' />
          I am looking for your transactions
          <Header.Subheader>
            Please wait a sec. This shouldn't take long!
          </Header.Subheader>
        </Header>
      </span>
    )
  }

  renderCards(txs) {
    return (
      <Card.Group>{txs.map(this.renderCard)}</Card.Group>
    )
  }

  renderCard(tx) {
    const confirmed = tx.persistence;
    const icon = confirmed ? (
      <Icon name="check" color="green" />
    ) : (
      <Icon name="close" color="yellow" />
    );
    const color = tx.value > 0 ? 'green' : tx.value < 0 ? 'red' : 'grey';
    const txHash = (
      <span className="hand" onClick={() => copyData(tx.hash, 'Transaction hash copied!', 'barcode')}>
        {tx.hash}
      </span>
    );
    const label = (
      <Label as="a" color={color} attached="top right" size="huge" className="tx-value"
             onClick={() => copyData(tx.value, 'Transaction value copied!', 'balance')}>
        {formatIOTAAmount(tx.value).short}
      </Label>
    );

    return (
      <Card raised key={tx.hash} fluid>
        <Card.Content>
          <Popup position="left center" trigger={label} content="Copy TX value"/>
          <Card.Header className="attached hand" onClick={() => this.openDetails(tx)}>
            <Popup position="right center" trigger={icon} content={confirmed? 'Confirmed' : 'Pending'} />
            {new Date(tx.timestamp * 1000).toLocaleString()}
          </Card.Header>
          <Card.Meta>{tx.tag}</Card.Meta>
          <Popup position="top center" trigger={
            <Card.Description className="dont-break-out-bare">
              {txHash}
            </Card.Description>
          } content="Click to copy the transaction hash"/>
        </Card.Content>
      </Card>
    )
  }

  openDetails(tx) {
    window.open(
      `https://thetangle.org/transaction/${tx.hash}`,
      '_blank'
    )
  }

  _sortTXs(txs) {
    return txs.sort((a, b) => b.timestamp - a.timestamp);
  }
}

export default withRouter(deepHoc(TXTable));
