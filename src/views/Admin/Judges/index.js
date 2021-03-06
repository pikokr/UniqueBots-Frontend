import React, {Component} from 'react';
import adminOnly from "../../../util/adminOnly";
import {gql, graphql} from "@apollo/react-hoc";
import {
    Button,
    CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Paper,
    Table, TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow, TextField, Typography
} from "@material-ui/core";
import GREEN from "@material-ui/core/colors/green";
import RED from "@material-ui/core/colors/red";
import {apolloClient} from "../../../apollo";
import {withSnackbar} from "notistack";
import BLUE from "@material-ui/core/colors/blue";
import config from "../../../config";

const APPROVE_QUERY = gql`
    query ($id: String!) {
        admin {
            judge(id: $id) {
                id
                approve
            }
        }
    }
`

const DENY_QUERY = gql`
    query ($id: String!, $reason: String!) {
        admin {
            judge(id: $id) {
                id
                deny(reason: $reason)
            }
        }
    }
`

class JudgeComponent extends Component {
    state = {
        dialog__approve: false,
        dialog__deny: false,
        processing__approve: false,
        processing__deny: false,
        deny_reason: ''
    }

    async approve() {
        this.setState({processing__approve: true})
        try {
            const data = await apolloClient.query({
                query: APPROVE_QUERY,
                variables: {
                    id: this.props.judge.id
                }
            })
            if (data.data.admin?.judge?.approve) {
                this.props.enqueueSnackbar('봇 등록이 승인되었습니다.', {
                    variant: 'success'
                })
            }
        } finally {
            this.closeApprove()
            await this.props.refetch()
        }
    }

    closeApprove() {
        this.setState({processing__approve: false, dialog__approve: false})
    }

    async deny() {
        if (!this.state.deny_reason) return this.props.enqueueSnackbar('거부 사유를 입력해주세요', {
            variant: 'error'
        })
        this.setState({processing__deny: true})
        try {
            const data = await apolloClient.query({
                query: DENY_QUERY,
                variables: {
                    id: this.props.judge.id,
                    reason: this.state.deny_reason
                }
            })
            if (data.data.admin?.judge?.deny) {
                this.props.enqueueSnackbar('봇 등록이 거부되었습니다.', {
                    variant: 'warning'
                })
            }
        } finally {
            this.closeDeny()
            await this.props.refetch()
        }
    }

    closeDeny() {
        this.setState({processing__deny: false, dialog__deny: false})
    }

    render() {
        const {judge} = this.props

        return <>
            <TableRow>
                <TableCell>
                    {judge.id} {judge.bot?.tag ? `(${judge.bot.tag})` : null}
                </TableCell>
                <TableCell>
                    {judge.bot?.brief}
                </TableCell>
                <TableCell>
                    {judge.requester}
                </TableCell>
                <TableCell>
                    {judge.bot?.prefix}
                </TableCell>
                <TableCell>
                    <Button variant="contained"
                            href={`https://discord.com/api/oauth2/authorize?client_id=${judge.id}&scope=bot&permissions=0&guild_id=${config.guild}`}
                            target="_blank"
                            style={{
                                width: '100%',
                                boxShadow: 'none',
                                backgroundColor: BLUE["500"],
                                color: '#fff'
                            }}>초대</Button>
                </TableCell>
                <TableCell>
                    <Button variant="contained"
                            style={{width: '100%', boxShadow: 'none', backgroundColor: GREEN["500"], color: '#fff'}}
                            onClick={() => this.setState({dialog__approve: true})}>승인</Button>
                </TableCell>
                <TableCell>
                    <Button variant="contained" style={{
                        width: '100%',
                        boxShadow: 'none',
                        backgroundColor: RED['500'],
                        color: '#fff'
                    }} onClick={() => this.setState({dialog__deny: true})}>거부</Button>
                </TableCell>
            </TableRow>
            <Dialog open={this.state.dialog__approve}>
                <DialogTitle>봇 등록을 승인할까요?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        봇 등록을 승인하면 사이트의 봇 리스트에 등록됩니다.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button style={{color: RED['500'], borderColor: RED['500']}}
                            disabled={this.state.processing__approve} onClick={() => this.closeApprove()}>
                        취소
                    </Button>
                    <Button disabled={this.state.processing__approve}
                            style={{color: GREEN["500"], borderColor: GREEN["500"]}} autoFocus
                            onClick={this.approve.bind(this)}>
                        {
                            this.state.processing__approve ?
                                <CircularProgress size={25} style={{color: GREEN["500"]}}/> : '승인'
                        }
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={this.state.dialog__deny}>
                <DialogTitle>봇 등록을 거부할까요?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        봇 등록을 거부하면 봇이 목록에서 삭제됩니다
                    </DialogContentText>
                    <TextField label="거부 사유" multiline required color="secondary" style={{
                        width: '100%'
                    }} value={this.state.deny_reason} onChange={e => this.setState({deny_reason: e.target.value})}/>
                </DialogContent>
                <DialogActions>
                    <Button style={{color: GREEN['500'], borderColor: GREEN['500']}}
                            disabled={this.state.processing__deny} onClick={() => this.closeDeny()}>
                        취소
                    </Button>
                    <Button disabled={this.state.processing__deny}
                            style={{color: RED["500"], borderColor: RED["500"]}} autoFocus
                            onClick={this.deny.bind(this)}>
                        {
                            this.state.processing__approve ?
                                <CircularProgress size={25} style={{color: GREEN["500"]}}/> : '거부'
                        }
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    }
}

const Judge = withSnackbar(JudgeComponent)

class Judges extends Component {
    componentDidMount() {
        this.props.data.refetch()
    }

    render() {
        return (
            <>
                <Typography variant="h4">심사 관리</Typography>
                {
                    this.props.data.loading ? <CircularProgress/> : (
                        this.props.data.error ? '에러' : this.props.data.admin && this.props.data.admin.judges.length !== 0 ?
                            <TableContainer component={Paper} style={{
                                overflow: 'auto'
                            }}>
                                <Table style={{
                                    display: 'block',
                                    overflowX: 'auto',
                                    whiteSpace: 'nowrap',
                                }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>짧은 설명</TableCell>
                                            <TableCell>신청자</TableCell>
                                            <TableCell>접두사</TableCell>
                                            <TableCell>초대</TableCell>
                                            <TableCell>승인</TableCell>
                                            <TableCell>거부</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            this.props.data.admin.judges.map((it, i) => (
                                                <Judge refetch={() => this.props.data.refetch()} judge={it} key={i}/>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer> : '대기중인 심사가 없습니다.'
                    )
                }
            </>
        );
    }
}

export default adminOnly(graphql(gql`
    query {
        admin {
            judges(pending: true) {
                id
                requester
                bot {
                    tag
                    brief
                    prefix
                }
            }
        }
    }
`)(Judges));