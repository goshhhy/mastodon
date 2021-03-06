import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import Button from 'flavours/glitch/components/button';

@injectIntl
export default class ConfirmationModal extends React.PureComponent {

  static propTypes = {
    message: PropTypes.node.isRequired,
    confirm: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onDoNotAsk: PropTypes.func,
    intl: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.button.focus();
  }

  handleClick = () => {
    this.props.onClose();
    this.props.onConfirm();
    if (this.props.onDoNotAsk && this.doNotAskCheckbox.checked) {
      this.props.onDoNotAsk();
    }
  }

  handleCancel = () => {
    this.props.onClose();
  }

  setRef = (c) => {
    this.button = c;
  }

  setDoNotAskRef = (c) => {
    this.doNotAskCheckbox = c;
  }

  render () {
    const { message, confirm, onDoNotAsk } = this.props;

    return (
      <div className='modal-root__modal confirmation-modal'>
        <div className='confirmation-modal__container'>
          {message}
        </div>

        <div>
          { onDoNotAsk && (
            <div className='confirmation-modal__do_not_ask_again'>
              <input type='checkbox' id='confirmation-modal__do_not_ask_again-checkbox' ref={this.setDoNotAskRef} />
              <label for='confirmation-modal__do_not_ask_again-checkbox'>
                <FormattedMessage id='confirmation_modal.do_not_ask_again' defaultMessage='Do not ask for confirmation again' />
              </label>
            </div>
          )}
          <div className='confirmation-modal__action-bar'>
            <Button onClick={this.handleCancel} className='confirmation-modal__cancel-button'>
              <FormattedMessage id='confirmation_modal.cancel' defaultMessage='Cancel' />
            </Button>
            <Button text={confirm} onClick={this.handleClick} ref={this.setRef} />
          </div>
        </div>
      </div>
    );
  }

}
