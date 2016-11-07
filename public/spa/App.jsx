/* jshint esnext: true */
'use strict';

class App extends React.Component {

  constructor(props) {
    super(props);

    let displayOptions = new Array(8).fill(0)
      .map( (x, ind) => { return {key: ind+2, value: ind+2}; }); 

    displayOptions = [ { key: 'all', value: 0} ].concat(displayOptions);

    this.displayLimit = 4;  // Just random number;
    this.state = { data: [], createNew: false, display: displayOptions };
  }

  /**
   * Initial Api Call to fetch the offers;
   */
  componentDidMount() {
    this.fetchOffers();
  }

  /**
   * Make the api call to grab the offers as per the displayLimit
   */
  fetchOffers() {
    axios.get('/offers/' + this.displayLimit)
      .then(response => this.setState(Object.assign(this.state, {data: response.data || []})))
      .catch(err => this.setState(Object.assign(this.state, {data: []})));
  }

  /**
   * sets the headers property with the headers that needs to be sent along with
   * the api calls
   */
  setHeader() {
    let token = $('meta[name="x-csrf-token"]').attr('content');
    this.headers = {
      headers: {
        'x-csrf-token': token,
        "Content-type": "application/json"
      }
    };
  }
  
  /**
   * Makes the api call to create a new business offer
   * and fetches the offers after the call;
   * @param {Object} data
   */
  addNew(data) {
    this.setState(Object.assign(this.state, {createNew: false}));
    this.setHeader();
    axios.post('/offer', {
      name: data.name,
      amount: data.amount,
      maximumRides: data.maximumRides
    }, this.headers)
    .then((response) => this.fetchOffers())
    .catch((err) => console.log('err:', err));
  }

  /**
   * sets the createNew property of the this.state to true
   * Used to toggle the button and creation text fields
   */
  createNew() {
    this.setState(Object.assign(this.state, {createNew: true}));
  }


  /**
   * Makes the api call to update the existing offer
   * @param {Object} data
   */
  updateOffer(data) {
    this.setHeader();
    return axios.post('/offerUpdate', {
      _id: data._id,
      name: data.name,
      amount: data.amount,
      maximumRides: data.maximumRides
    }, this.headers);
  }

  /**
   * Makes the api call to delete the existing offer
   * @param {Object} data
   */
  deleteOffer(data) {
    this.setHeader();
    return axios.delete('/offer/' + data._id, this.headers);
  }

  /**
   * Use to delete and update the existing offers
   * @param {number} index
   * @return Function
   */
  changed(index) {
    return (data) => {
      let update = data ? this.updateOffer(data) : this.deleteOffer(this.state.data[index]);
      update
        .then(resposne => this.fetchOffers())
        .catch((err) => this.fetchOffers());
    };
  }

  /**
   * Change the number of offers to be displayed
   * @param {Event} event
   */
  displayLimitChange(event) {
    this.displayLimit = event.target.value;
    this.fetchOffers(this.displayLimit);
  }


  render() {
    let tableStyle = {
      height: '500px',
      overflow: 'auto'
    };
    return(
      <div className="container">

        <div className="row">
          <div className="col-xs-4">
            Displaying Max.
          </div>
          <div className="col-xs-6">
            <select className="form-control col-xs-8" onChange={this.displayLimitChange.bind(this)}>
              {this.state.display.map(d => <option value={d.value} selected={d.value===this.displayLimit}>{d.key}</option>)}
            </select>
          </div>
          <div className="col-xs-2">
            Offers
          </div>
        </div>
        <br />

        <div style={tableStyle} className="row">
          <table className="table">
            <thead>
              <tr>
                <td>id</td>
                <td>Name</td>
                <td>Amount</td>
                <td>MaximumRides</td>
                <td>Action</td>
              </tr>
            </thead>
            <tbody>
              {this.state.data.map( (d, index) => <TRow data={d} key={index} callback={this.changed.call(this, index)} />)}
            </tbody>
          </table>
        </div>
        {
          this.state.createNew ?
              <NewOffer callback={this.addNew.bind(this)}/>
            :
            <button className="btn btn-block btn-primary" onClick={this.createNew.bind(this)}>Create</button>
        }
      </div>
    );
  }

}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
