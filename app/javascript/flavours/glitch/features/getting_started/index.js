import React from 'react';
import Column from 'flavours/glitch/features/ui/components/column';
import ColumnLink from 'flavours/glitch/features/ui/components/column_link';
import ColumnSubheading from 'flavours/glitch/features/ui/components/column_subheading';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { openModal } from 'flavours/glitch/actions/modal';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { me, invitesEnabled, version } from 'flavours/glitch/util/initial_state';
import { fetchFollowRequests } from 'flavours/glitch/actions/accounts';
import { List as ImmutableList } from 'immutable';
import { createSelector } from 'reselect';
import { fetchLists } from 'flavours/glitch/actions/lists';
import { preferencesLink, profileLink, signOutLink } from 'flavours/glitch/util/backend_links';

const messages = defineMessages({
  heading: { id: 'getting_started.heading', defaultMessage: 'Getting started' },
  home_timeline: { id: 'tabs_bar.home', defaultMessage: 'Home' },
  notifications: { id: 'tabs_bar.notifications', defaultMessage: 'Notifications' },
  public_timeline: { id: 'navigation_bar.public_timeline', defaultMessage: 'Federated timeline' },
  navigation_subheading: { id: 'column_subheading.navigation', defaultMessage: 'Navigation' },
  settings_subheading: { id: 'column_subheading.settings', defaultMessage: 'Settings' },
  community_timeline: { id: 'navigation_bar.community_timeline', defaultMessage: 'Local timeline' },
  direct: { id: 'navigation_bar.direct', defaultMessage: 'Direct messages' },
  bookmarks: { id: 'navigation_bar.bookmarks', defaultMessage: 'Bookmarks' },
  preferences: { id: 'navigation_bar.preferences', defaultMessage: 'Preferences' },
  settings: { id: 'navigation_bar.app_settings', defaultMessage: 'App settings' },
  follow_requests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
  sign_out: { id: 'navigation_bar.logout', defaultMessage: 'Logout' },
  lists: { id: 'navigation_bar.lists', defaultMessage: 'Lists' },
  keyboard_shortcuts: { id: 'navigation_bar.keyboard_shortcuts', defaultMessage: 'Keyboard shortcuts' },
  lists: { id: 'navigation_bar.lists', defaultMessage: 'Lists' },
  lists_subheading: { id: 'column_subheading.lists', defaultMessage: 'Lists' },
  misc: { id: 'navigation_bar.misc', defaultMessage: 'Misc' },
  menu: { id: 'getting_started.heading', defaultMessage: 'Getting started' },
});

const makeMapStateToProps = () => {
  const getOrderedLists = createSelector([state => state.get('lists')], lists => {
    if (!lists) {
      return lists;
    }

    return lists.toList().filter(item => !!item).sort((a, b) => a.get('title').localeCompare(b.get('title')));
  });

  const mapStateToProps = state => ({
    lists: getOrderedLists(state),
    myAccount: state.getIn(['accounts', me]),
    columns: state.getIn(['settings', 'columns']),
    unreadFollowRequests: state.getIn(['user_lists', 'follow_requests', 'items'], ImmutableList()).size,
    unreadNotifications: state.getIn(['notifications', 'unread']),
  });

  return mapStateToProps;
};

const mapDispatchToProps = dispatch => ({
  fetchFollowRequests: () => dispatch(fetchFollowRequests()),
  fetchLists: () => dispatch(fetchLists()),
  openSettings: () => dispatch(openModal('SETTINGS', {})),
});

const badgeDisplay = (number, limit) => {
  if (number === 0) {
    return undefined;
  } else if (limit && number >= limit) {
    return `${limit}+`;
  } else {
    return number;
  }
};

@connect(makeMapStateToProps, mapDispatchToProps)
@injectIntl
export default class GettingStarted extends ImmutablePureComponent {

  static propTypes = {
    intl: PropTypes.object.isRequired,
    myAccount: ImmutablePropTypes.map.isRequired,
    columns: ImmutablePropTypes.list,
    multiColumn: PropTypes.bool,
    fetchFollowRequests: PropTypes.func.isRequired,
    unreadFollowRequests: PropTypes.number,
    unreadNotifications: PropTypes.number,
    lists: ImmutablePropTypes.list,
    fetchLists: PropTypes.func.isRequired,
    openSettings: PropTypes.func.isRequired,
  };

  componentWillMount () {
    this.props.fetchLists();
  }

  componentDidMount () {
    const { myAccount, fetchFollowRequests } = this.props;

    if (myAccount.get('locked')) {
      fetchFollowRequests();
    }
  }

  render () {
    const { intl, myAccount, columns, multiColumn, unreadFollowRequests, unreadNotifications, lists, openSettings } = this.props;

    const navItems = [];
    let listItems = [];

    if (multiColumn) {
      if (!columns.find(item => item.get('id') === 'HOME')) {
        navItems.push(<ColumnLink key='0' icon='home' text={intl.formatMessage(messages.home_timeline)} to='/timelines/home' />);
      }

      if (!columns.find(item => item.get('id') === 'NOTIFICATIONS')) {
        navItems.push(<ColumnLink key='1' icon='bell' text={intl.formatMessage(messages.notifications)} badge={badgeDisplay(unreadNotifications)} to='/notifications' />);
      }

      if (!columns.find(item => item.get('id') === 'COMMUNITY')) {
        navItems.push(<ColumnLink key='2' icon='users' text={intl.formatMessage(messages.community_timeline)} to='/timelines/public/local' />);
      }

      if (!columns.find(item => item.get('id') === 'PUBLIC')) {
        navItems.push(<ColumnLink key='3' icon='globe' text={intl.formatMessage(messages.public_timeline)} to='/timelines/public' />);
      }
    }

    if (!multiColumn || !columns.find(item => item.get('id') === 'DIRECT')) {
      navItems.push(<ColumnLink key='4' icon='envelope' text={intl.formatMessage(messages.direct)} to='/timelines/direct' />);
    }

    if (!multiColumn || !columns.find(item => item.get('id') === 'BOOKMARKS')) {
      navItems.push(<ColumnLink key='5' icon='bookmark' text={intl.formatMessage(messages.bookmarks)} to='/bookmarks' />);
    }

    if (myAccount.get('locked')) {
      navItems.push(<ColumnLink key='6' icon='users' text={intl.formatMessage(messages.follow_requests)} badge={badgeDisplay(unreadFollowRequests, 40)} to='/follow_requests' />);
    }

    navItems.push(<ColumnLink key='7' icon='ellipsis-h' text={intl.formatMessage(messages.misc)} to='/getting-started-misc' />);

    listItems = listItems.concat([
      <div key='8'>
        <ColumnLink key='9' icon='bars' text={intl.formatMessage(messages.lists)} to='/lists' />
        {lists.map(list =>
          <ColumnLink key={(9 + Number(list.get('id'))).toString()} to={`/timelines/list/${list.get('id')}`} icon='list-ul' text={list.get('title')} />
        )}
      </div>,
    ]);

    return (
      <Column name='getting-started' icon='asterisk' heading={intl.formatMessage(messages.heading)} label={intl.formatMessage(messages.menu)} hideHeadingOnMobile>
        <div className='scrollable optionally-scrollable'>
          <div className='getting-started__wrapper'>
            <ColumnSubheading text={intl.formatMessage(messages.navigation_subheading)} />
            {navItems}
            <ColumnSubheading text={intl.formatMessage(messages.lists_subheading)} />
            {listItems}
            <ColumnSubheading text={intl.formatMessage(messages.settings_subheading)} />
            { preferencesLink !== undefined && <ColumnLink icon='cog' text={intl.formatMessage(messages.preferences)} href={preferencesLink} /> }
            <ColumnLink icon='cogs' text={intl.formatMessage(messages.settings)} onClick={openSettings} />
            <ColumnLink icon='sign-out' text={intl.formatMessage(messages.sign_out)} href={signOutLink} method='delete' />
          </div>

          <div className='getting-started__footer'>
            <ul>
              <li><a href='https://bridge.joinmastodon.org/' target='_blank'><FormattedMessage id='getting_started.find_friends' defaultMessage='Find friends from Twitter' /></a> · </li>
              {invitesEnabled && <li><a href='/invites' target='_blank'><FormattedMessage id='getting_started.invite' defaultMessage='Invite people' /></a> · </li>}
              <li><a href='/about/more' target='_blank'><FormattedMessage id='navigation_bar.info' defaultMessage='About this instance' /></a> · </li>
              <li><a href='https://joinmastodon.org/apps' target='_blank'><FormattedMessage id='navigation_bar.apps' defaultMessage='Mobile apps' /></a> · </li>
              <li><a href='/terms' target='_blank'><FormattedMessage id='getting_started.terms' defaultMessage='Terms of service' /></a> · </li>
              <li><a href='https://docs.joinmastodon.org' target='_blank'><FormattedMessage id='getting_started.documentation' defaultMessage='Documentation' /></a></li>
            </ul>

            <p>
              <FormattedMessage
                id='getting_started.open_source_notice'
                defaultMessage='Glitchsoc is open source software, a friendly fork of {Mastodon}. You can contribute or report issues on GitHub at {github}.'
                values={{
                  github: <span><a href='https://github.com/glitch-soc/mastodon' rel='noopener' target='_blank'>glitch-soc/mastodon</a> (v{version})</span>,
                  Mastodon: <a href='https://github.com/tootsuite/mastodon' rel='noopener' target='_blank'>Mastodon</a> }}
              />
            </p>
          </div>
        </div>
      </Column>
    );
  }

}
