const axios = require("axios");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const MatchLiveDetails = require("../models/matchlive");
const Matches = require("../models/match");
const getkeys = require("../utils/crickeys");
const db = require("../utils/firebaseinitialize");
const { getcommentary } = require("../utils/getcommentary");
const { sendMyPlayerNotifications } = require("../utils/sendMyPlayerNotifications");
const { detectHighlights } = require("../utils/detectHighlights");
const Series = require("../models/series");
const MatchLiveCommentary = require("../models/matchCommentary");
const { homegraph } = require("googleapis/build/src/apis/homegraph");

const transporter = nodemailer.createTransport(
    smtpTransport({
        host: process.env.smtp_host,
        port: process.env.smtp_port,
        secure: true,
        auth: {
            user: process.env.smtp_user,
            pass: process.env.smtp_password,
        },
    })
);

const mailOptions = {
    from: process.env.smtp_email,
    to: "rajeshmn47@gmail.com",
    subject: "Real time notification of your favourite player",
    text: `riyan parag is batting`,
};

//initializeApp({
//credential: cert(serviceAccount),
//});

//const db = getFirestore();
// Add a new document with a generated id.
module.exports.addLivecommentaryCustom = async function addcommentry(format) {
    try {
        // await Series.updateMany({}, { $set: { importance: "medium" } })
        let date = new Date();
        let allMatches = [];
        const endDate = new Date(date.getTime());
        date = new Date(date.getTime() - 120 * 60 * 60 * 1000);
        let matches;
        if (format == "low" || format == "high" || format == "very_high") {
            matches = await Matches.find({
                date: {
                    $gte: new Date(date),
                    $lt: new Date(endDate),
                }
            }).populate("series");
            console.log(format, 'importance')
            matches = matches.filter(m => {
                if (!m.seriesId) return false;
                return m.importance == format || m.series.importance == format
            });
        }
        else {
            console.log(format, 'mediumz')
            matches = await Matches.find({
                format: format,
                //importance: "medium",
                //matchId: "116828",
                date: {
                    $gte: new Date(date),
                    $lt: new Date(endDate),
                },
            });
        }

        //  const citiesRef = db.db.collection('commentary');
        //  const snapshot = await citiesRef.get();
        //  if (snapshot.empty) {
        //    console.log('No matching documents.');
        //    return;
        // }
        // snapshot.forEach(async doc => {
        //  console.log(doc.id, '=>', doc.data());
        //  const commentaryRef = db.db.collection("commentary").doc(doc.id);
        //  const res = await commentaryRef.set(
        //    {
        //      commentary: [...doc.data().capital],
        //      livedata: !doc.data().matchdata ? 'not found' : doc.data().matchdata,
        //      miniscore: !doc.data().miniscore ? 'not found' : doc.data().miniscore
        //    },
        //    { merge: true }
        // );
        //});
        for (let i = 0; i < matches.length; i++) {
            const matchid = matches[i].matchId;
            //const teams = await Team.find({ matchId: matchid });
            const teams = ['1']
            console.log(matchid, 'jio')
            const match = await MatchLiveDetails.findOne({ matchId: matchid });
            if (match && (!(match.result == "Complete")) && (match?.isInPlay)) {
                allMatches.push(matches[i]);
            }
        }
        const m = allMatches;
        console.log(m.length, "cricket allmatches");
        for (let i = 0; i < allMatches.length; i++) {
            if (m[i].matchId.length > 3) {
                console.log(m[i]?.matchId, "matchid");
                //const keys = await getkeys.getkeys();
                let teamHomeCommentary = [];
                let teamAwayCommentary = [];
                const options = {
                    method: "GET",
  maxBodyLength: Infinity,
  url: `https://blazerbob.com/cricbuzz/match/${m[i].matchId}/commentary`,
  headers: {
    "x-auth-user": "e51eca4b3e7649dbbc2cb1d250d9e020",
  }
};
                const options2 = {
                   method: "GET",
  maxBodyLength: Infinity,
  url: `https://blazerbob.com/cricbuzz/match/${m[i].matchId}/commentary`,
  headers: {
    "x-auth-user": "e51eca4b3e7649dbbc2cb1d250d9e020",
  }
};
                try {
                    let response = await axios.request(options);
                    //console.log(response?.data, "commentary");
                    let innings = 2;
                    if (response?.data?.commentary?.[0]?.commentaryList?.length > 0) {
                        response = await axios.request(options);
                    }
                    else {
                        innings = 1;
                        response = await axios.request(options2);
                    }
                    if (response?.data?.commentary?.[0]?.commentaryList?.length > 0) {
                        const a = response?.data?.commentary?.[0]?.commentaryList.reverse();
                        const matchdata = response.data.matchDetails?.matchHeader;
                        const { miniscore } = response.data?.matchDetails;
                        const commentaryRef = db.db.collection("commentary").doc(m[i].matchId);
                        const doc = await commentaryRef.get();
                        if (!doc.exists) {
                            await sendMyPlayerNotifications(miniscore?.batsmanStriker?.batId, miniscore?.bowlerStriker?.bowlId)
                            const commentaryRef = db.db.collection("commentary").doc(m[i].matchId);
                            const res = await commentaryRef.set(
                                {
                                    commentary: [...a],
                                    livedata: matchdata,
                                    miniscore,
                                },
                                { merge: true }
                            );
                        } else {
                            const commentaryRef = db.db.collection("commentary").doc(m[i].matchId);
                            let xyz = doc.data().commentary;
                            if (a?.length > 0) {
                                let commentary = getcommentary(xyz, a, innings);
                                //let commentary = a;
                                console.log(miniscore?.batsmanStriker?.batId, 'miniscore')
                                await sendMyPlayerNotifications(miniscore?.batsmanStriker?.batId, miniscore?.bowlerStriker?.bowlId)
                                if (miniscore?.batsmanStriker?.batId == 12305) {
                                    transporter.sendMail(mailOptions, (error, info) => {
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log(`Email sent: ${info.response}`);
                                        }
                                    });
                                }
                                //console.log(commentary, 'commentary')
                                let home = matches?.[i].teamHomeName
                                let away = matches?.[i].teamAwayName
                                const res = await commentaryRef.set(
                                    {
                                        commentary: [...commentary],
                                        livedata: matchdata,
                                        miniscore,
                                    },
                                    { merge: true }
                                );
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
};
