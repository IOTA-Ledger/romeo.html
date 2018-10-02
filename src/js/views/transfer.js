import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import {
  Card,
  Grid,
  Message,
  Header,
  Icon,
  Step,
  Table,
  Divider,
  Button,
  Label,
  Segment,
  Responsive,
  Checkbox,
  Popup
} from 'semantic-ui-react';
import romeo from '@semkodev/romeo.lib';
import Nav from '../components/nav';
import { get, showInfo } from '../romeo';
import { searchSpentAddressThunk } from '../reducers/ui';
import { formatIOTAAmount } from '../utils';
import deepHoc from '../components/deep-hoc';
import TransferRow from '../components/transfer-row';

import classes from './transfer.css';

class Transfer extends React.Component {
  constructor(props) {
    super(props);
    const { location } = props;
    this.state = {
      maxStep: 0,
      currentStep: 0,
      autoInput: true,
      forceInput: false,
      sending: false,
      transfers: [
        {
          address: (location && location.state && location.state.address) || '',
          tag: (location && location.state && location.state.tag) || '',
          value: (location && location.state && location.state.value) || 0,
          unit: 1000000,
          valid: false,
          identifier: romeo.utils.createIdentifier()
        }
      ],
      donation: {
        address: this.props.donationAddress,
        tag: '999DEVIOTAROMEODONATION999',
        value: 0,
        unit: 1000000,
        valid: true,
        identifier: romeo.utils.createIdentifier()
      }
    };
    this.handleChange0 = this.handleChange0.bind(this);
    this.handleChange1 = this.handleChange1.bind(this);
    this.sendTransfer = this.sendTransfer.bind(this);
    this.addTransfer = this.addTransfer.bind(this);
    this.romeo = get();
  }

  componentWillMount() {
    this.setObjects(this.props.currentIndex);
  }

  componentWillReceiveProps(props) {
    const { currentIndex } = props;
    if (currentIndex !== this.props.currentIndex) {
      this.setObjects(currentIndex);
    }
  }

  setObjects(currentIndex) {
    this.pageObject = this.romeo.pages.getByIndex(currentIndex).page;
    this.setState({
      inputs: this.pageObject
        .getInputs(true)
        .filter(i => i.balance > 0)
        .map(i => ({
          address: i.address,
          security: i.security,
          keyIndex: i.keyIndex,
          spent: i.spent,
          balance: i.balance,
          selected: false
        }))
        .sort((a, b) => b.keyIndex - a.keyIndex)
    });
  }

  render() {
    const { currentStep, sending } = this.state;
    return (
      <span>
        <Nav />
        <Segment basic style={{ padding: 0 }} loading={sending}>
          {this.renderSteps()}
          {this[`renderStep${currentStep}`]()}
        </Segment>
      </span>
    );
  }

  renderSteps() {
    const { currentStep, maxStep, sending } = this.state;
    const selectStep = index => {
      if (sending || currentStep === index || maxStep < index) return;
      this.setState({ currentStep: index });
    };
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column computer={8} tablet={16} mobile={16}>
            <Step.Group fluid>
              <Step
                active={currentStep === 0}
                disabled={sending || maxStep < 0}
                completed={maxStep > 0}
                onClick={() => selectStep(0)}
              >
                <Icon name="send" />
                <Step.Content>
                  <Step.Title>Destination</Step.Title>
                  <Step.Description>Address and value</Step.Description>
                </Step.Content>
              </Step>

              <Step
                active={currentStep === 1}
                disabled={sending || maxStep < 1}
                completed={maxStep > 1}
                onClick={() => selectStep(1)}
              >
                <Icon name="payment" />
                <Step.Content>
                  <Step.Title>Source</Step.Title>
                  <Step.Description>Page addresses to use</Step.Description>
                </Step.Content>
              </Step>

              <Step
                active={currentStep === 2}
                disabled={sending || maxStep < 2}
                completed={maxStep > 2}
                onClick={() => selectStep(2)}
              >
                <Icon name="info" />
                <Step.Content>
                  <Step.Title>Confirm transfer</Step.Title>
                </Step.Content>
              </Step>
            </Step.Group>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  renderStep0() {
    const { transfers } = this.state;
    const canAddTransfer =
      transfers.length < this.romeo.guard.getMaxOutputs() - 1;
    const addButton = canAddTransfer ? (
      <Grid.Row>
        <Grid.Column mobile={12} computer={4} tablet={6}>
          <Button onClick={this.addTransfer} fluid color="purple">
            <Icon name="plus" />
            Add another transfer
          </Button>
        </Grid.Column>
      </Grid.Row>
    ) : null;

    return (
      <span>
        <Card.Group>
          {transfers.map((t, i) => (
            <TransferRow
              key={t.identifier}
              identifier={t.identifier}
              address={t.address}
              tag={t.tag}
              value={t.value}
              unit={t.unit}
              onChange={value => this.handleChange0(i, value)}
              onRemove={
                transfers.length > 1 ? () => this.removeTransfer(i) : false
              }
            />
          ))}
          {addButton}
        </Card.Group>
        {this.renderDonation()}
        {this.renderTotalStep0()}
      </span>
    );
  }

  renderStep1() {
    const { transfers, donation, forceInput, autoInput } = this.state;
    const totalValue =
      donation.value * donation.unit + transfers.reduce((s, t) => s + t.value * t.unit, 0);
    const hasEnoughInputs = this.hasEnoughInputs();
    const hasSufficientInputs = this.hasSufficientFunds();
    const message =
      hasSufficientInputs && !hasEnoughInputs
        ? this.renderTooManyInputs1()
        : null;
    let content = totalValue < 1 ? this.renderNoInput1() : this.renderInput1();

    return (
      <Grid>
        {message}
        {content}
        <Grid.Row>
          <Grid.Column computer={12} tablet={16} mobile={16} textAlign="right">
            <Divider />
            {this.renderCancelButton()}
            <Button
              color="olive"
              size="large"
              disabled={
                ((forceInput || !autoInput) && !hasEnoughInputs) ||
                !hasSufficientInputs
              }
              onClick={() =>
                this.setState({
                  currentStep: 2,
                  maxStep: 2
                })
              }
            >
              <Icon name="info" /> Confirm transfer
            </Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  renderStep2() {
    const { transfers, donation } = this.state;
    const totalValue =
      donation.value * donation.unit + transfers.reduce((s, t) => s + t.value * t.unit, 0);
    const usingSpentInputs = this.getSpentInputs().length;
    const donationRow =
      donation.value > 0 ? (
        <Table.Row positive>
          <Table.Cell className="dont-break-out">
            <Label ribbon color="purple">
              <Icon name="heart" /> Donation
            </Label>
            {donation.address}
          </Table.Cell>
          <Table.Cell className="dont-break-out">
            <Label>
              <Icon name="tag" />
              {donation.tag.padEnd(27, '9')}
            </Label>
          </Table.Cell>
          <Table.Cell textAlign="right">
            <Responsive maxWidth={767}>
              <Divider />
            </Responsive>
            <Header as="h2" textAlign="right" color="green">
              <Header.Content>
                {formatIOTAAmount(donation.value * donation.unit).short}
                <Header.Subheader>{donation.value * donation.unit}</Header.Subheader>
              </Header.Content>
            </Header>
          </Table.Cell>
        </Table.Row>
      ) : null;
    const spentWarning = usingSpentInputs ? (
      <Header as="h3" textAlign="center" color="red">
        WARNING: You are sending from an already spent address.
        <br />This will decrease the security of this address significantly.
        <br />Ensure you do not receive funds to this address again!
      </Header>
    ) : null;

    const ledgerWarning = this.romeo.guard.opts.name === 'ledger'
      ? (
        <Grid.Row>
          <Grid.Column computer={12} tablet={16} mobile={16}>
            <Message
              info
              icon="usb"
              header="Ledger detected"
              content={
                <span>
              During the transfer, please take a look at your Ledger: You will
              have to confirm the transaction before it can be completed!
            </span>
              }
            />
          </Grid.Column>
        </Grid.Row>
      )
      : null;

    return (
      <Grid>
        {ledgerWarning}
        <Grid.Row>
          <Grid.Column computer={12} tablet={16} mobile={16}>
            <Table striped stackable compact fixed>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width={7}>Address</Table.HeaderCell>
                  <Table.HeaderCell width={6}>Tag</Table.HeaderCell>
                  <Table.HeaderCell width={3}>Value</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {transfers.map(t => (
                  <Table.Row key={t.identifier}>
                    <Table.Cell className="dont-break-out">
                      {t.address}
                    </Table.Cell>
                    <Table.Cell className="dont-break-out">
                      <Label>
                        <Icon name="tag" />
                        {t.tag.padEnd(27, '9')}
                      </Label>
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      <Responsive maxWidth={767}>
                        <Divider />
                      </Responsive>
                      <Header as="h2" textAlign="right" color="green">
                        <Header.Content>
                          {formatIOTAAmount(t.value * t.unit).short}
                          <Header.Subheader>{t.value * t.unit}</Header.Subheader>
                        </Header.Content>
                      </Header>
                    </Table.Cell>
                  </Table.Row>
                ))}
                {donationRow}
                <Table.Row>
                  <Table.Cell>
                    <Header as="h4">Total:</Header>
                  </Table.Cell>
                  <Table.Cell />
                  <Table.Cell textAlign="right">
                    <Responsive maxWidth={767}>
                      <Divider />
                    </Responsive>
                    <Header as="h2" textAlign="right" color="green">
                      <Header.Content>
                        {formatIOTAAmount(totalValue).short}
                        <Header.Subheader>{totalValue}</Header.Subheader>
                      </Header.Content>
                    </Header>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column computer={12} tablet={16} mobile={16} textAlign="right">
            {spentWarning}
            <Divider />
            {this.renderCancelButton()}
            <Button color="olive" size="large" onClick={this.sendTransfer}>
              <Icon name="send" /> &nbsp; Send transfer(s)
            </Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  renderDonation() {
    const { donation, transfers } = this.state;
    const canAddTransfer =
      transfers.length < this.romeo.guard.getMaxOutputs() - 1;

    if (!donation.address || !donation.address.length || !canAddTransfer) return null;

    return (
      <Card.Group>
        <TransferRow
          disableAddress
          onChange={value => this.handleChange0('donation', value)}
          identifier={donation.identifier}
          address={donation.address}
          tag={donation.tag}
          value={donation.value}
          unit={donation.unit}
          name="Show some ❤️"
          description="Add a small donation for the Field Nodes"
        />
      </Card.Group>
    );
  }

  removeTransfer(position) {
    const { transfers } = this.state;
    const newTransfers = transfers.slice();
    newTransfers.splice(position, 1);
    this.setState({ transfers: newTransfers });
  }

  addTransfer() {
    const { transfers } = this.state;
    const newTransfers = transfers.slice();
    newTransfers.splice(transfers.length, 0, {
      address: '',
      tag: '',
      value: 0,
      valid: false,
      identifier: romeo.utils.createIdentifier()
    });
    this.setState({ transfers: newTransfers });
  }

  getSpentInputs() {
    const { inputs } = this.state;
    return inputs.filter(i => i.spent && i.selected);
  }

  inputNotTransfer(input) {
    const { transfers } = this.state;

    for (const k in transfers) {
      if (
        transfers[k].address.substring(0, 81) == input.address.substring(0, 81)
      )
        return false;
    }

    return true;
  }

  hasEnoughInputs() {
    const { transfers, donation, inputs } = this.state;
    const totalValue =
      donation.value * donation.unit + transfers.reduce((s, t) => s + t.value * t.unit, 0);
    const validInputs = inputs.filter(
      i => (!i.spent || i.selected) && this.inputNotTransfer(i)
    );
    return (
      validInputs
        .sort((a, b) => b.balance - a.balance)
        .slice(0, this.romeo.guard.getMaxInputs())
        .reduce((t, i) => t + i.balance, 0) >= totalValue
    );
  }

  hasSufficientFunds() {
    const { transfers, donation, inputs, autoInput } = this.state;
    const totalValue =
      donation.value * donation.unit + transfers.reduce((s, t) => s + t.value * t.unit, 0);
    const validInputs = inputs.filter(
      i => ((autoInput && !i.spent) || i.selected) && this.inputNotTransfer(i)
    );

    return validInputs.reduce((t, i) => t + i.balance, 0) >= totalValue;
  }

  renderCancelButton () {
    const { history } = this.props;
    return (
      <Responsive as="span" minWidth={480}>
        <Button size="large" color="red" onClick={() => history.push(`/page/${this.pageObject.opts.index + 1}`)}>
          Cancel
        </Button>
      </Responsive>
    )
  }

  renderTotalStep0() {
    const { page: { page: { balance: pageBalance } } } = this.props;
    const { transfers, donation } = this.state;
    const totalValue =
      donation.value * donation.unit + transfers.reduce((s, t) => s + t.value * t.unit, 0);
    const formattedValue = formatIOTAAmount(totalValue).short;
    const enoughBalance = totalValue <= pageBalance;
    const color = totalValue >= 0 && enoughBalance ? 'green' : 'red';
    const nextStep = totalValue > 0 ? 1 : 2;

    const canProceed = enoughBalance && this.canGoToStep1();

    return (
      <Grid>
        <Grid.Row>
          <Grid.Column width={12} textAlign="right">
            <Divider />
            {this.renderCancelButton()}
            <Button
              disabled={!canProceed}
              color="olive"
              size="large"
              onClick={() =>
                this.setState({
                  currentStep: nextStep,
                  maxStep: nextStep,
                  forceInput:
                    !this.hasSufficientFunds() || !this.hasEnoughInputs()
                })
              }
            >
              <Icon name="payment" /> &nbsp; Select inputs
            </Button>
          </Grid.Column>
          <Grid.Column width={4}>
            <Divider />
            <Header
              as="h2"
              textAlign="right"
              color={color}
              className="valueDisplay"
            >
              <Header.Content>
                {formattedValue}
                <Header.Subheader>
                  {!enoughBalance && 'Not enough balance!'}
                </Header.Subheader>
              </Header.Content>
            </Header>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  renderInput1() {
    const { autoInput, forceInput } = this.state;

    const content =
      autoInput && !forceInput ? (
        <Message
          info
          icon="at"
          header="Automatic address selection enabled"
          content={
            <span>
              The source/input addresses to cover the total transfer value will
              be selected automatically.
            </span>
          }
        />
      ) : (
        this.renderInputTable1()
      );

    return [
      <Grid.Row key="checkbox">
        <Grid.Column computer={12} tablet={16} mobile={16}>
          <Checkbox
            toggle
            disabled={forceInput}
            onChange={() => this.setState({ autoInput: !autoInput })}
            label="Automatic source selection"
            checked={autoInput && !forceInput}
          />
        </Grid.Column>
      </Grid.Row>,
      <Grid.Row key="content">
        <Grid.Column computer={12} tablet={16} mobile={16}>
          {content}
        </Grid.Column>
      </Grid.Row>
    ];
  }

  renderInputTable1() {
    const { transfers, donation, inputs } = this.state;
    const totalValue =
      donation.value * donation.unit + transfers.reduce((s, t) => s + t.value * t.unit, 0);
    const selectedValue = inputs
      .filter(i => i.selected)
      .reduce((t, i) => t + i.balance, 0);
    const outstanding = Math.max(0, totalValue - selectedValue);
    const invalidInput = inputs.filter(i => !this.inputNotTransfer(i));

    return (
      <Table compact celled definition>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell>Address</Table.HeaderCell>
            <Table.HeaderCell>Balance</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {inputs.map((i, x) => (
            <Table.Row
              key={i.address}
              negative={i.selected && i.spent}
              positive={i.selected && !i.spent}
            >
              <Table.Cell>
                <Checkbox
                  toggle
                  disabled={invalidInput.includes(i)}
                  onChange={() => this.handleChange1(x)}
                  checked={i.selected}
                />
              </Table.Cell>
              <Table.Cell className="dont-break-out">
                {!i.spent && !invalidInput.includes(i) ? (
                  <Icon name="check" color="green" />
                ) : (
                  <Icon name="close" color="red" />
                )}
                {i.spent ? (
                  <Popup
                    trigger={<span>{i.address}</span>}
                    position="top left"
                    content="This address is marked as spent. If possible, do not use!"
                  />
                ) : invalidInput.includes(i) ? (
                  <Popup
                    trigger={<span>{i.address}</span>}
                    position="top left"
                    content="Can't use transfer address as input!"
                  />
                ) : (
                  i.address
                )}
              </Table.Cell>
              <Table.Cell textAlign="right">
                <Responsive maxWidth={767}>
                  <Divider />
                </Responsive>
                <Header as="h2" textAlign="right" color="green">
                  <Header.Content>
                    {formatIOTAAmount(i.balance).short}
                    <Header.Subheader>{i.balance}</Header.Subheader>
                  </Header.Content>
                </Header>
              </Table.Cell>
            </Table.Row>
          ))}
          <Table.Row active>
            <Table.Cell />
            <Table.Cell>
              <Header as="h4">Total needed:</Header>
            </Table.Cell>
            <Table.Cell>
              <Responsive maxWidth={767}>
                <Divider />
              </Responsive>
              <Header as="h2" textAlign="right" color="green">
                <Header.Content>
                  {formatIOTAAmount(totalValue).short}
                  <Header.Subheader>{totalValue}</Header.Subheader>
                </Header.Content>
              </Header>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell />
            <Table.Cell>
              <Header as="h4">Pending to select:</Header>
            </Table.Cell>
            <Table.Cell>
              <Responsive maxWidth={767}>
                <Divider />
              </Responsive>
              <Header
                as="h2"
                textAlign="right"
                color={outstanding ? 'red' : 'green'}
              >
                <Header.Content>
                  {formatIOTAAmount(outstanding).short}
                  <Header.Subheader>{outstanding}</Header.Subheader>
                </Header.Content>
              </Header>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
  }

  renderNoInput1() {
    return (
      <Grid.Row>
        <Grid.Column computer={12} tablet={16} mobile={16}>
          <Message
            info
            icon="at"
            header="You do not need to select input addresses"
            content={
              <span>
                Since the total value of your transactions is zero, no input
                addresses are necessary.
              </span>
            }
          />
        </Grid.Column>
      </Grid.Row>
    );
  }

  renderTooManyInputs1() {
    return (
      <Grid.Row>
        <Grid.Column computer={12} tablet={16} mobile={16}>
          <Message
            error
            icon="at"
            header={`Your login method only support a maximum of ${this.romeo.guard.getMaxInputs()} input addresses!`}
            content={
              <span>
                You would need more inputs to make this transaction, which is
                currently not supported by your login method. As a workaround,
                you can try transferring all the needed funds from your smaller
                addresses to a single one and making the transfer from that
                address afterwards.
              </span>
            }
          />
        </Grid.Column>
      </Grid.Row>
    );
  }

  canGoToStep1() {
    const { donation, transfers } = this.state;
    return !transfers.find(t => !t.valid) && donation.valid;
  }

  handleChange0(pos, value) {
    if (pos === 'donation') {
      this.setState({ donation: value });
      return;
    }
    const { transfers } = this.state;
    const newTransfers = transfers.slice();
    newTransfers[pos] = value;
    this.setState({ transfers: newTransfers });
  }

  handleChange1(pos) {
    const { inputs } = this.state;
    const newInputs = inputs.slice();
    newInputs[pos] = Object.assign({}, inputs[pos], {
      selected: !inputs[pos].selected
    });
    this.setState({ inputs: newInputs });
  }

  async sendTransfer() {
    const { history } = this.props;
    const { donation, transfers, autoInput, forceInput, inputs } = this.state;
    transfers.forEach(t => (t.tag = t.tag ? t.tag : ''));
    const totalValue =
      donation.value * donation.unit + transfers.reduce((s, t) => s + t.value * t.unit, 0);
    const txs = transfers.slice().map(t => Object.assign({}, t, { value: t.value * t.unit }));

    if (donation.value && donation.valid) {
      txs.push(Object.assign({}, donation, { value: donation.value * donation.unit }));
    }
    let txInputs = inputs.filter(i => i.selected);

    if (autoInput && !forceInput) {
      txInputs = [];
      let inputValue = 0;
      const validUnspent = inputs.filter(
        i => !i.spent && this.inputNotTransfer(i)
      );
      const validSpent = inputs.filter(
        i => i.spent && this.inputNotTransfer(i)
      );
      for (let x = 0; x < validUnspent.length; x++) {
        txInputs.push(validUnspent[x]);
        inputValue += validUnspent[x].balance;
        if (inputValue >= totalValue) break;
      }
      if (inputValue < totalValue) {
        for (let x = 0; x < validSpent.length; x++) {
          txInputs.push(validSpent[x]);
          inputValue += validSpent[x].balance;
          if (inputValue >= totalValue) break;
        }
      }
    }

    try {
      this.setState({ sending: true });
      await this.pageObject.sendTransfers(
        txs, txInputs, null, null, 7000,
        this.romeo.guard.opts.name === 'ledger');
      this.setState({ sending: false });
      history.push(`/page/${this.pageObject.opts.index + 1}`);
      showInfo(
        <span>
          <Icon name="send" /> Transfer sent!
        </span>
      );
      // sync after transaction completed
      await this.pageObject.sync(true, 7000);
    } catch (error) {
      this.setState({ sending: false });
      history.push(`/page/${this.pageObject.opts.index + 1}`);
      showInfo(
        <span>
          <Icon name="close" />&nbsp;
          {(error && error.message) || 'Failed sending the transfers!'}
        </span>,
        5000,
        'error'
      );
    }
  }
}

function mapStateToProps(state, props) {
  const { pages } = state.romeo;
  const { match: { params } } = props;
  const currentIndex = parseInt((params && params.page) || 0) - 1;
  const page = pages.find(p => p.page.index === currentIndex);
  return {
    currentIndex,
    page,
    ui: state.ui,
    donationAddress:
      state.field && state.field.season && state.field.season.address
  };
}

function mapDispatchToProps(dispatch) {
  return {
    searchSpent: address => dispatch(searchSpentAddressThunk(address))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(deepHoc(Transfer));
