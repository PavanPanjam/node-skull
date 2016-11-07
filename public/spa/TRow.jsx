/* jshint esnext: true */

/**
 * Object that represents each row in the table view
 */
class TRow extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      editable: false,
      data: Object.assign({}, this.props.data)
    };
    this.currentDataState = Object.assign({}, this.props.data);
    this.validState = true;
  }

  /**
   * Change the state to reflect the input from the user
   * @param {Event} event
   */
  handleNameChange(event) {
    let name = event.target.value;
    let data = Object.assign({}, this.state.data, {name: name});
    this.setState(Object.assign({}, this.state, {data: data}));
    this.currentDataState = Object.assign({}, data);
    this.checkValidity();
  }

  /**
   * Change the state to reflect the input(Amount) from the user
   * @param {Event} event
   */
  handleAmountChange(event) {
    let amount = event.target.value;
    let data = Object.assign({}, this.state.data, {amount: amount});
    this.setState(Object.assign({}, this.state, {data: data}));
    this.currentDataState = Object.assign({}, data);
    this.checkValidity();
  }

  /**
   * Change the state to reflect the input(maxRides) from the user
   * @param {Event} event
   */
  handleMaxRideChange(event) {
    let maxRides = event.target.value;
    let data = Object.assign({}, this.state.data, {maximumRides: maxRides});
    this.setState(Object.assign({}, this.state, {data: data}));
    this.currentDataState = Object.assign({}, data);
    this.checkValidity();
  }

  /**
   * Save the user entered changes(calls the callback to update the database)
   */
  save() {
    this.setState({editable: false});
    this.props.callback(this.state.data);
  }

  /**
   * sets the validState property based on the values entered in textbox are valid
   */
  checkValidity() {
    this.validState = this.currentDataState.name && 
      +this.currentDataState.amount && +this.currentDataState.maximumRides;
  }

  /**
   * deletes the offer(calls the callback with not argument to delete it)
   */
  delete() {
    this.props.callback();
  }

  /**
   * reset the state to original
   */
  cancel() {
    this.setState(Object.assign({}, this.state, {editable: false, data: this.props.data}));
  }

  /**
   * display the editable fields
   */
  show() {
    this.state.data = Object.assign({}, this.props.data);
    this.setState(Object.assign({}, this.state, {editable: true}));
    this.currentDataState = Object.assign({}, this.state.data);
    this.checkValidity();
  }

  render() {
    if (this.state.editable) {
      return (
        <tr>
          <td>
            {this.state.data._id}
          </td>
          <td>
            <input type="text" value={this.state.data.name} onChange={this.handleNameChange.bind(this)} />
          </td>
          <td>
            <input type="text" value={this.state.data.amount} onChange={this.handleAmountChange.bind(this)} />
          </td>
          <td>
            <input type="text" value={this.state.data.maximumRides} onChange={this.handleMaxRideChange.bind(this)} />
          </td>
          <td>
              <button className="btn btn-sm btn-primary" onClick={this.save.bind(this)} disabled={!this.validState}>Save</button>
              <button className="btn btn-sm btn-danger" onClick={this.cancel.bind(this)}>Cancel</button>
          </td>
        </tr>
      );
    } else {
      return (
          <tr>
            <td>{this.props.data._id}</td>
            <td>{this.props.data.name}</td>
            <td>{this.props.data.amount}</td>
            <td>{this.props.data.maximumRides}</td>
            <td>
              <button className="btn btn-sm btn-primary" onClick={this.show.bind(this)}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={this.delete.bind(this)}>Delete</button>
            </td>
          </tr>
      );
    }
  }

}
