import React, {Component} from 'react';
import {gql, graphql} from "@apollo/react-hoc";
import {Button, Chip, CircularProgress, Grid, Paper, Typography, withStyles} from "@material-ui/core";
import markdownIt from 'markdown-it'
import {Check} from "@material-ui/icons";
import GREEN from '@material-ui/core/colors/green'
import BLUE from '@material-ui/core/colors/blue'
import {motion} from "framer-motion";

const md = markdownIt({
    html: false
})

const AnimatedGrid = motion.custom(Grid)
const AnimatedChip = motion.custom(Chip)
const AnimatedButton = motion.custom(Button)

const chipVariants = {
    hidden: {
        y: 20,
        opacity: 0
    },
    visible: {
        y: 0,
        opacity: 1
    }
}

class BotInfo extends Component {
    state = {
        description: null
    }

    componentDidMount() {
        this.props.data.refetch({
            id: this.props.match.params.id
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.state.description) {
            if (this.props.data.bot) {
                this.setState({
                    description: md.render(this.props.data.bot.description)
                })
            }
        }
    }

    render() {
        const {classes} = this.props

        let bot = this.props.data.bot

        return (
            <div>
                {
                    !this.props.data.loading && bot ? (
                        <Grid container spacing={2} justify="center">
                            <AnimatedGrid variants={{initial: {opacity: 0}, visible: {opacity: 1, transition: {delay: 0.25}}}} initial="initial" animate="visible" className={classes.avatar} item xs={12} md={6}>
                                <img src={bot.avatar} alt="avatar" width={250} height={250}/>
                            </AnimatedGrid>
                            <Grid item xs={12} md={6} style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <Typography className={classes.textMdCenter} initial="hidden" animate="visible" variants={{visible: {transition: {staggerChildren: 0.02, delayChildren: 0.3}}}} component={motion.h4} variant="h4">
                                    {bot.tag.split('').map((it, key) => (
                                        <motion.span variants={{hidden: {opacity: 0}, visible: {opacity: 1}}} key={key}>{it}</motion.span>
                                    ))}
                                </Typography>
                                <Typography className={classes.textMdCenter} variant="h6" initial="hidden" animate="visible" variants={{visible: {transition: {staggerChildren: 0.02, delayChildren: 0.3}}}} component={motion.h6}>
                                    {bot.brief.split('').map((it, key) => (
                                        <motion.span variants={{hidden: {opacity: 0}, visible: {opacity: 1}}} key={key}>{it}</motion.span>
                                    ))}
                                </Typography>
                                <motion.div variants={{visible: {transition: {staggerChildren: 0.1, delayChildren: 0.4}}}} initial="hidden" animate="visible" style={{flexGrow: 1}} className={classes.textMdCenter}>
                                    <AnimatedChip variants={chipVariants} className={classes.chip} label={`서버 ${bot.guilds}개`} color="primary"/>
                                    {bot.discordVerified && <AnimatedChip variants={chipVariants} className={classes.chip} icon={<Check/>} label="디스코드에서 인증됨" style={{backgroundColor: GREEN.A400}}/>}
                                </motion.div>
                                <motion.div variants={{visible: {transition: {staggerChildren: 0.1, delayChildren: 0.6}}}} initial="hidden" animate="visible">
                                    <AnimatedButton variants={chipVariants} variant="outlined" style={{
                                        borderColor: BLUE.A400,
                                        color: BLUE.A400
                                    }} href={bot.invite} target="_blank">
                                        초대하기
                                    </AnimatedButton>
                                </motion.div>
                            </Grid>
                            <AnimatedGrid variants={{hidden: {y: 50, opacity: 0}, visible: {y: 0, opacity: 1, transition: {delay: 0.8}}}} initial="hidden" aniamte="visible" item xs={12} md={8}>
                                <Paper style={{padding: 10}}>
                                    <div className="markdown-body" dangerouslySetInnerHTML={{__html: this.state.description || 'Compiling..'}}/>
                                </Paper>
                            </AnimatedGrid>
                        </Grid>
                    ) : this.props.data.loading ? <CircularProgress/> : '봇을 찾을 수 없습니다'
                }
            </div>
        );
    }
}

export default graphql(gql`
query ($id: String!) {
    bot(id: $id) {
        avatar
        brief
        description
        guilds
        id
        id
        locked
        invite
        discordVerified
        prefix
        status
        tag
        owner {
            id
            tag
            avatarURL
        }
    }
}
`, {
    options: {
        variables: {
            id: ''
        }
    }
})(withStyles(theme => ({
    avatar: {
        display: 'flex',
        [theme.breakpoints.down('sm')]: {
            justifyContent: 'center',
        },
        justifyContent: 'flex-end'
    },
    textMdCenter: {
        [theme.breakpoints.down('sm')]: {
            textAlign: 'center',
        }
    },
    chip: {
        margin: theme.spacing(0.5)
    }
}))(BotInfo))