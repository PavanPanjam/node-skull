/* jshint esnext: true */
/**
 * Object represents the fields that are displayed when creating a new offer
 */
class NewOffer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      amount: null,
      maximumRides: null,
      valid: false
    };
  }

  /**
   * reflect the state with the input enterd in the name field
   * @param {Event} event
   */
  handleNameChange(event) {
    let name = event.target.value;
    this.changeState({name: name});
  }

  /**
   * reflect the state with the input entered in the Amount field
   * @param {Event} event
   */
  handleAmountChange(event) {
    let amount = event.target.value;
    this.changeState({amount: amount});
  }

  /**
   * reflect the state with the input entered in the MaximumRides field
   * @param {Event} event
   */
  handleMaxRideChange(event) {
    let maxRides = event.target.value;
    this.changeState({maximumRides: maxRides});
  }

  /**
   * Changes the state of the object by setting the valid field to true/false;
   * @param {Object} obj 
   */
  changeState(obj) {
    // this.state reflects current state(anti pattern(mutating this.state) but harmless in this case)
    this.state = Object.assign(this.state, obj);
    if (this.checkValidity()) {
      this.state = Object.assign({}, this.state, {valid: true});
      this.setState(this.state);
    } else {
      this.state = Object.assign({}, this.state, {valid: false});
      this.setState(this.state);
    }
  }

  /**
   * Checks all the editable fields are valid 
   * @return Boolean
   */
  checkValidity() {
    return this.state.name && +this.state.amount && +this.state.maximumRides;
  }

  /**
   * Stores the new deal in the database(by calling the callback fn passed through props)
   */
  add() {
    let data = {
      name: this.state.name,
      amount: +this.state.amount,
      maximumRides: +this.state.maximumRides 
    };
    this.props.callback(data);
  }

  render() {
    return (
      <div>
        <table className="table"> 
          <tbody>
            <tr>
              <td>
                <input type="text" onChange = {this.handleNameChange.bind(this)} placeholder="Name" />
              </td>
              <td>
                <input type="Amount" onChange = {this.handleAmountChange.bind(this)} placeholder="Amount (Number)" required/>
              </td>
              <td>
                <input type="text" onChange = {this.handleMaxRideChange.bind(this)} placeholder="maxRides (Number)" />
              </td>
              <td>
                <button className="btn btn-sm btn-success" disabled={!this.state.valid} onClick={this.add.bind(this)}> Add </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}
