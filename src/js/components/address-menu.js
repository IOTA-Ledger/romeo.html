import React from 'react';
import { Icon, Header, Menu } from 'semantic-ui-react';
import { get, isCurrentIndex } from '../romeo';
import AddressMenuItem from './address-menu-item';
import deepHoc from './deep-hoc';

class AddressMenu extends React.Component {
  constructor(props) {
    super(props);
    this.addNewAddress = this.addNewAddress.bind(this);
    this.romeo = get();
  }
  render() {
    const { page, selectedAddress } = this.props;
    const addresses = Object.values(page.page.addresses).sort(
      (a, b) => b.keyIndex - a.keyIndex
    );
    const adding = page.page.jobs.find(
      j => j.opts.type === 'NEW_ADDRESS' && !j.isFinished
    );
    if (page.page.isSyncing && !adding && addresses.length === 0) {
      return null;
    }
    const pageObject = this.romeo.pages.getByIndex(page.page.index).page;
    const isCurrent = isCurrentIndex(page.keyIndex);
    const addButton = (
      <Menu.Item onClick={this.addNewAddress} disabled={!!adding && isCurrent}>
        <Header as="h4" textAlign="left" color={isCurrent ? 'green' : 'grey'}>
          <Icon name={adding ? 'spinner' : 'asterisk'} loading={!!adding} />
          <Header.Content>
            {adding
              ? 'Adding new address'
              : isCurrent
                ? 'Add new address'
                : 'Archived page: no new addresses'}
          </Header.Content>
        </Header>
      </Menu.Item>
    );

    return (
      <Menu vertical style={{ width: '100%' }}>
        {addButton}
        {addresses.map((address, i) => (
          <AddressMenuItem
            address={address}
            key={address.address}
            currentPage={page.page.isCurrent}
            pageObject={pageObject}
            anySelected={!!selectedAddress}
            latestAddress={i === 0}
            selected={
              selectedAddress &&
              selectedAddress.slice(0, 81) === address.address
            }
          />
        ))}
      </Menu>
    );
  }

  addNewAddress() {
    const { page } = this.props;
    const isCurrent = isCurrentIndex(page.keyIndex);
    if (!isCurrent) return;
    const pageObject = this.romeo.pages.getByIndex(page.page.index).page;
    pageObject.getNewAddress();
  }
}

export default deepHoc(AddressMenu);
