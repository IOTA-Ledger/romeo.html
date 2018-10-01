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
    this.renderRow = this.renderRow.bind(this);
    this.renderCard = this.renderCard.bind(this);
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

    return (
      <Table striped stackable compact fixed>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={8}>Transaction</Table.HeaderCell>
            <Responsive as={Table.HeaderCell} width={5} maxWidth={767}>
              Tag
            </Responsive>
            <Table.HeaderCell width={4}>View</Table.HeaderCell>
            <Table.HeaderCell textAlign="right" width={3}>
              <Checkbox
                toggle
                checked={hideZero}
                label="Value"
                onChange={() => this.setState({ hideZero: !hideZero })}
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        {this.renderRows(this._sortTXs(txs))}
      </Table>
    );
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

    return (
      <Card raised key={tx.hash}>
        <Card.Content>
          <Label textAlign="right" color={color} corner="right">
            <Icon name={tx.value > 0 ? 'plus circle' : tx.value < 0 ? 'minus circle' : 'info circle'} />
          </Label>
          <Card.Header>
            <Popup position="right center" trigger={icon} content={confirmed? 'Confirmed' : 'Pending'} />
            {new Date(tx.timestamp * 1000).toLocaleString()}
          </Card.Header>
          <Card.Meta>{tx.tag}</Card.Meta>
          <Popup position="top center" trigger={
            <Card.Description className="dont-break-out-bare">
              <span className="hand" onClick={() => copyData(tx.hash, 'Transaction hash copied!', 'barcode')}>
                {tx.hash}
              </span>
            </Card.Description>
          } content="Click to copy the transaction hash"/>
        </Card.Content>
        <Card.Content extra>
          <div className='ui three buttons'>
            <Button color={color} onClick={() => copyData(tx.value, 'Transaction value copied!', 'balance')}>
              {formatIOTAAmount(tx.value).short}
            </Button>
            <Button
              basic
              color={color}
              icon
              size="tiny"
              onClick={() =>
                window.open(
                  `https://thetangle.org/transaction/${tx.hash}`,
                  '_blank'
                )
              }
            >
              <Icon name="external" /> TX
            </Button>
            <Button
              basic
              color="teal"
              icon
              size="tiny"
              onClick={() =>
                window.open(`https://thetangle.org/bundle/${tx.bundle}`, '_blank')
              }
            >
              <Icon name="external" /> Bundle
            </Button>
          </div>
        </Card.Content>
      </Card>
    )
  }

  renderRows(txs) {
    return <Table.Body>{txs.map(this.renderRow)}</Table.Body>;
  }

  renderRow(tx) {
    const confirmed = tx.persistence;
    const icon = confirmed ? (
      <Icon name="check" color="green" />
    ) : (
      <Icon name="close" color="yellow" />
    );
    const color = tx.value > 0 ? 'green' : tx.value < 0 ? 'red' : 'grey';

    const buttons = mini => (
      <Button.Group fluid>
        <Button
          icon
          size="tiny"
          onClick={() =>
            window.open(
              `https://thetangle.org/transaction/${tx.hash}`,
              '_blank'
            )
          }
        >
          {mini ? (
            <span>
              <Icon name="external" /> &nbsp; TN
            </span>
          ) : (
            <span>
              <Icon name="external" /> &nbsp; Transaction
            </span>
          )}
        </Button>
        <Button
          icon
          size="tiny"
          onClick={() =>
            window.open(`https://thetangle.org/bundle/${tx.bundle}`, '_blank')
          }
        >
          {mini ? (
            <span>
              <Icon name="external" /> &nbsp; BN
            </span>
          ) : (
            <span>
              <Icon name="external" /> &nbsp; Bundle
            </span>
          )}
        </Button>
      </Button.Group>
    );

    return (
      <Table.Row
        key={tx.hash}
        negative={tx.value < 0}
        positive={tx.value > 0}
        warning={!confirmed}
      >
        <Table.Cell className="ellipsible" width={8}>
          <Header as="h4" textAlign="left">
            {icon}
            <Header.Content>
              {new Date(tx.timestamp * 1000).toLocaleString()}
              <Responsive as={Label} minWidth={1201}>
                <Icon name="tag" />
                {tx.tag}
              </Responsive>
              <Responsive as={Label} minWidth={830} maxWidth={960}>
                <Icon name="tag" />
                {tx.tag}
              </Responsive>
            </Header.Content>
          </Header>
        </Table.Cell>
        <Responsive as={Table.Cell} maxWidth={767} width={4}>
          <Label>
            <Icon name="tag" />
            {tx.tag}
          </Label>
        </Responsive>
        <Table.Cell width={5}>
          <Responsive maxWidth={767}>{buttons(false)}</Responsive>
          <Responsive minWidth={768} maxWidth={1200}>
            {buttons(true)}
          </Responsive>
          <Responsive minWidth={1201}>{buttons(false)}</Responsive>
        </Table.Cell>
        <Table.Cell textAlign="right" width={3}>
          <Responsive maxWidth={767}>
            <Divider />
          </Responsive>
          <Header as="h2" textAlign="right" color={color}>
            {formatIOTAAmount(tx.value).short}
          </Header>
        </Table.Cell>
      </Table.Row>
    );
  }

  _sortTXs(txs) {
    return txs.sort((a, b) => b.timestamp - a.timestamp);
  }

  _shorten(txt, length = 54) {
    return `${txt.slice(0, length)}...`;
  }
}

export default withRouter(deepHoc(TXTable));
