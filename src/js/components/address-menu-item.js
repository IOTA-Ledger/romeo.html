import React from 'react';
import { Route, Switch } from 'react-router';
import { withRouter } from 'react-router-dom';
import QRCode from 'qrcode.react';
import { Menu, Icon, Header, Label, Popup, Button } from 'semantic-ui-react';
import { get, showInfo } from '../romeo';
import { formatIOTAAmount } from '../utils';
import { copyData } from './current-page-menu-item';
import deepHoc from './deep-hoc';

import classes from './page-menu-item.css';

class AddressMenuItem extends React.Component {
  render() {
    const {
      address: { address, balance, rawBalance, spent, keyIndex, transactions },
      pageObject,
      currentPage,
      selected,
      history,
      anySelected,
      latestAddress,
      match: { params }
    } = this.props;
    const romeo = get();
    const checkedAddress = romeo.iota.utils.addChecksum(address);
    const pageIndex = params && params.page;
    const spa = balance > 0 && rawBalance > 0;
    const selectAddress = () =>
      history.push(
        selected
          ? `/page/${pageIndex}`
          : `/page/${pageIndex}/address/${checkedAddress}`
      );
    const copyAddress = e => {
      e.stopPropagation();
      e.preventDefault();
      copyData(romeo.iota.utils.addChecksum(address), 'Address copied!', 'at');
    };
    const text = spent ? (
      spa ? (
        <span>
          <Header as="h5" color="red">
            Spent address with funds!
          </Header>
          Transfer to another address ASAP and never use this address again!
        </span>
      ) : (
        <span>
          <Header as="h5" color="red">
            NOT usable!
          </Header>
          Spent address! Do not send funds here!&nbsp;
          {!currentPage && 'This page is archived, any way!'}
        </span>
      )
    ) : balance > 0 ? (
      rawBalance > 0 ? (
        <span>
          <Header as="h5" color={currentPage ? 'green' : 'yellow'}>
            {currentPage ? 'Usable!' : 'Archived page address'}
          </Header>
          Address has positive balance, but has not been spent.&nbsp;
          {!currentPage &&
            'You should transfer these funds to the current page!'}
        </span>
      ) : (
        <span>
          <Header as="h5" color="red">
            NOT usable!
          </Header>
          An outgoing transaction is pending. Do not send funds here!&nbsp;
          {!currentPage && 'This page is archived, any way!'}
        </span>
      )
    ) : (
      <span>
        <Header as="h5" color={currentPage ? 'green' : 'yellow'}>
          {currentPage ? 'Usable!' : 'Archived page address'}
        </Header>
        Empty address with no balance.&nbsp;
        {!currentPage && 'However, this page is archived. So do not use!'}
      </span>
    );

    const tags = (
      <span className="tags">
        <Label size="mini">
          <Icon name="balance" /> {formatIOTAAmount(balance).short}
        </Label>
        <Label size="mini">{Object.keys(transactions).length} TXs</Label>
      </span>
    );
    const showMoreInfo = (selected || (!anySelected && latestAddress)) &&
      (!spent || spa) &&
      currentPage;
    const isLedger = romeo.guard.opts.name === 'ledger';
    const qrcode = showMoreInfo
       ? (
        <Popup
          position="left center"
          trigger={
            <div className="qrcode" onClick={copyAddress}>
              <QRCode
                value={romeo.iota.utils.addChecksum(address)}
                size={256}
              />
            </div>
          }
          content="Click to copy the address!"
        />
      ) : (
        ''
      );

    const viewButton = (fluid) => (
      <Button basic color='teal' fluid={fluid} onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(
          `https://thetangle.org/address/${address}`,
          '_blank'
        )
      }
      }>
        <Icon name="external" /> View
      </Button>
    );
    const buttons = true //showMoreInfo
       ? isLedger && pageObject
        ? (
          <div className='ui two buttons address-actions'>
              <Button basic color='green' onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                displayAddress(pageObject, keyIndex)
              }}>
                <Icon name="usb" /> Ledger
              </Button>
            {viewButton(false)}
          </div>
        )
        : (
          <div className='address-actions'>{viewButton(true)}</div>
        )
       : null;

    return (
      <Menu.Item onClick={selectAddress} active={selected}>
        <Popup
          position="left center"
          trigger={
            <Header
              as="h4"
              textAlign="left"
              color={
                spent
                  ? spa ? 'red' : 'grey'
                  : balance > 0 ? 'purple' : currentPage ? 'green' : 'grey'
              }
            >
              <Icon
                name={
                  spent
                    ? spa ? 'exclamation triangle' : 'external square'
                    : balance > 0 ? 'square' : 'square outline'
                }
              />
              <Header.Content>
                Address #{keyIndex + 1}
                {tags}
                <Header.Subheader className="menuSubHeader ellipsible">
                  {checkedAddress}
                </Header.Subheader>
              </Header.Content>
            </Header>
          }
          content={text}
        />
        {qrcode}
        {buttons}
      </Menu.Item>
    );
  }
}

function displayAddress(pageObject, keyIndex) {
  pageObject.displayAddress(keyIndex);
  showInfo(
    <span>
      <Icon name="eye" />
      Please check the address displayed on your Ledger. It should match with the current one.
      If it doesn't - do not use it!
    </span>
  );
}

export default withRouter(AddressMenuItem);
