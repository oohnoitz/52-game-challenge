class App extends React.Component {
  constructor() {
    super();
    this.state = {
      games: [],
      stats: []
    };
  }

  getGameListData() {
    $.ajax({
      url: $('#app').data('url'),
      dataType: 'json',
      success: function(data) {
        this.setState({
          games: data.games
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  }

  componentDidMount() {
    this.getGameListData();
  }

  render() {
    return (
      <GameList games={this.state.games}/>
    );
  }
}

class Notice extends React.Component {
  render() {
    return (
      <section className="section--center section--alert mdl-grid mdl-grid--no-spacing mdl-shadow--2dp">
        <div className="mdl-grid">
          <span className="mdl-typography--text-center">
            Any games listed in the queue may be subjected to change or removed.
          </span>
        </div>
      </section>
    )
  }
}

class GameList extends React.Component {
  render() {
    return (
      <div className="mdl-layout__tab-panel">
        <Notice />
        {
          this.props.games.map(function(game, idx) {
            return <GameCard key={idx+1} idx={idx+1} data={game}/>;
          })
        }
        <GameListTotal games={this.props.games}/>
      </div>
    )
  }
}

class GameListTotal extends React.Component {
  getTotalOngoing(games) {
    return games.reduce(function(total, game) {
      return total + Number(Boolean(game.dates[0])) - Number(Boolean(game.dates[1]));
    }, 0);
  }

  getTotalComplete(games) {
    return games.reduce(function(total, game) {
      return total + Number(Boolean(game.dates[1]));
    }, 0);
  }

  getTotalPlayTime(games) {
    return games.reduce(function(total, game) {
      return total + game.hours;
    }, 0);
  }

  getTotalPlatform(games) {
    return games.reduce(function(total, game) {
      if (game.dates[0] !== null) {
        total[game.platform] = total[game.platform] || { completed: 0, ongoing: 0, playTime: 0 }
        total[game.platform]['playTime'] += game.hours;

        if (game.dates[1] !== null) {
          total[game.platform]['completed']++;
        }

        if (game.dates[1] === null) {
          total[game.platform]['ongoing']++;
        }
      }

      return total;
    }, {});
  }

  renderPlatformStatistics() {
    var totalPlatform = this.getTotalPlatform(this.props.games);
    return Object.keys(totalPlatform).map(function(platform) {
      return <GameListTotalStatistic data={totalPlatform[platform]} platform={platform} />
    });
  }

  render() {
    return (
      <table className="table--center mdl-data-table mdl-data-table--selectable mdl-shadow--2dp">
        <thead>
          <tr>
            <th className="mdl-data-table__cell--non-numeric">Platform</th>
            <th>Ongoing</th>
            <th>Completed</th>
            <th>Play Time</th>
          </tr>
        </thead>
        <tbody>
          {this.renderPlatformStatistics()}
          <tr>
            <td></td>
            <td>{this.getTotalOngoing(this.props.games)}</td>
            <td>{this.getTotalComplete(this.props.games)}</td>
            <td>{this.getTotalPlayTime(this.props.games).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    )
  }
}

class GameListTotalStatistic extends React.Component {
  render() {
    console.log(this.props)
    return (
      <tr>
        <td className="mdl-data-table__cell--non-numeric">{this.props.platform}</td>
        <td>{this.props.data.ongoing}</td>
        <td>{this.props.data.completed}</td>
        <td>{this.props.data.playTime.toFixed(2)}</td>
      </tr>
    )
  }
}

class GameCard extends React.Component {
  render() {
    return (
      <section className="section--center mdl-grid mdl-grid--no-spacing mdl-shadow--2dp">
        <GameCardHead data={this.props.data}/>
        <GameCardInfo data={this.props.data} idx={this.props.idx}/>
      </section>
    )
  }
}

class GameCardHead extends React.Component {
  render() {
    return (
      <header className="mdl-cell mdl-cell--3-col-desktop mdl-cell--2-col-tablet mdl-cell--4-col-phone mdl-color--teal-100">
        <img src={this.props.data.appid ? `https://steamcdn-a.akamaihd.net/steam/apps/${this.props.data.appid}/header.jpg` : this.props.data.image}/>
      </header>
    )
  }
}

class GameCardDate extends React.Component {
  render() {
    var startDate = this.props.data.dates[0] || '2016/??/??';
    var endDate = this.props.data.dates[1] || '2016/??/??';

    return (
      <p>{startDate} - {endDate} ({this.props.data.hours.toFixed(2)} Hours)</p>
    )
  }
}

class GameCardPlay extends React.Component {
  render() {
    var playState = null, fontColor = 'black';

    if (this.props.data.dates[0] !== null || this.props.data.hours > 0) {
      playState = 'Playing...';
    }

    if (this.props.data.dates[1] !== null && this.props.data.hours > 0) {
      fontColor = 'green';
      playState = 'Complete!';
    }

    return (
      <span className={`mdl-button text-${fontColor}`}>{playState}</span>
    )
  }
}

class GameCardInfo extends React.Component {
  formatNumber(n) {
    var width = 3;
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
  }

  render() {
    return (
      <div className="mdl-card mdl-cell mdl-cell--9-col-desktop mdl-cell--6-col-tablet mdl-cell--4-col-phone">
        <div className="mdl-card__supporting-text">
          <h4>{this.props.data.title}</h4>
          <GameCardDate data={this.props.data}/>
          {this.props.data.review}
        </div>
        <div className="mdl-card__actions">
          <span className={`mdl-button mdl-card__platform-${this.props.data.platform.toLowerCase()}`}>{this.props.data.platform}</span>
          <GameCardPlay data={this.props.data}/>
          <span className={`mdl-button mdl-card__text-right`}>#{this.formatNumber(this.props.idx.toString())}</span>
        </div>
      </div>
    )
  }
}

React.render(<App />, document.getElementById('app'));
