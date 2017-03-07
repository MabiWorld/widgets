import { connect } from 'react-redux';
import ServerStat from '../components/ServerStat';

function mapStateToProps(state, ownProps) {
	return {};
}

const ServerStatContainer = connect(
	mapStateToProps
)(ServerStat);

export default ServerStatContainer;