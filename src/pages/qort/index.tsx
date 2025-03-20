import * as React from 'react';
import WalletContext from '../../contexts/walletContext';
import { epochToAgo, humanFileSize, timeoutDelay } from '../../common/functions'
import { styled } from "@mui/system";
import { useTheme } from '@mui/material/styles';
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Tab,
  Table,
  TableBody,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography
} from '@mui/material';
import { NumericFormat } from 'react-number-format';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import Slide, { SlideProps } from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import QRCode from 'react-qr-code';
import {
  CheckCircleOutline,
  Close,
  CopyAllTwoTone,
  FirstPage,
  HistoryToggleOff,
  ImportContacts,
  InfoOutlined,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPage,
  QrCode2,
  Refresh,
  Send
} from '@mui/icons-material';
import coinLogoQORT from '../../assets/qort.png';

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
      </IconButton>
    </Box>
  );
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500,
  },
});

const DialogGeneral = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  "& .MuiDialog-paper": {
    borderRadius: "15px",
  },
}));

const WalleteCard = styled(Card)({
  maxWidth: "100%",
  margin: "20px, auto",
  padding: "24px",
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
});

const CoinAvatar = styled(Avatar)({
  width: 120,
  height: 120,
  margin: "0 auto 16px",
  transition: "transform 0.3s",
  "&:hover": {
    transform: "scale(1.05)",
  },
});

const WalletButtons = styled(Button)({
  width: "auto",
  backgroundColor: "#05a2e4",
  color: "white",
  padding: "auto",
  "&:hover": {
    backgroundColor: "#02648d",
  },
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#02648d',
    color: theme.palette.common.white,
    fontSize: 14,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 13,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const QortSubmittDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  "& .MuiDialog-paper": {
    borderRadius: "15px",
  },
}));

export default function QortalWallet() {
  const { isAuthenticated, userInfo, nodeInfo } = React.useContext(WalletContext);

  if (!isAuthenticated) {
    return (
      <Alert variant="filled" severity="error">
        You must sign in, to use the Qortal wallet !!!
      </Alert>
    );
  }

  const [walletBalanceQort, setWalletBalanceQort] = React.useState<any>(null);
  const [copyQortAddress, setCopyQortAddress] = React.useState('');
  const [paymentInfo, setPaymentInfo] = React.useState<any>([]);
  const [arbitraryInfo, setArbitraryInfo] = React.useState<any>([]);
  const [atInfo, setAtInfo] = React.useState<any>([]);
  const [groupInfo, setGroupInfo] = React.useState<any>([]);
  const [nameInfo, setNameInfo] = React.useState<any>([]);
  const [assetInfo, setAssetInfo] = React.useState<any>([]);
  const [pollInfo, setPollInfo] = React.useState<any>([]);
  const [rewardshareInfo, setRewardshareInfo] = React.useState<any>([]);
  const [value, setValue] = React.useState('One');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [openQortQR, setOpenQortQR] = React.useState(false);
  const [openQortAddressBook, setOpenQortAddressBook] = React.useState(false);
  const [loadingRefreshQort, setLoadingRefreshQort] = React.useState(false);
  const [openQortSend, setOpenQortSend] = React.useState(false);
  const [openTxQortSubmit, setOpenTxQortSubmit] = React.useState(false);
  const [openSendQortSuccess, setOpenSendQortSuccess] = React.useState(false);
  const [openSendQortError, setOpenSendQortError] = React.useState(false);
  const [sendDisabled, setSendDisabled] = React.useState(true);
  const [qortAmount, setQortAmount] = React.useState<number>(0);
  const [qortRecipient, setQortRecipient] = React.useState('');

  const emptyRowsPayment = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - paymentInfo.length) : 0;
  const emptyRowsArbitrary = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - arbitraryInfo.length) : 0;
  const emptyRowsAt = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - atInfo.length) : 0;
  const emptyRowsGroup = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - groupInfo.length) : 0;
  const emptyRowsName = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - nameInfo.length) : 0;
  const emptyRowsAsset = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - assetInfo.length) : 0;
  const emptyRowsPoll = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - pollInfo.length) : 0;
  const emptyRowsRewardshare = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rewardshareInfo.length) : 0;

  const handleOpenQortQR = () => {
    setOpenQortQR(true);
  }

  const handleCloseQortQR = () => {
    setOpenQortQR(false);
  }

  const handleOpenAddressBook = async () => {
    setOpenQortAddressBook(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setOpenQortAddressBook(false);
  }

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number,) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const changeCopyQortcStatus = async () => {
    setCopyQortAddress('Copied !!!');
    await timeoutDelay(2000);
    setCopyQortAddress('');
  }

  const handleOpenQortSend = () => {
    setQortAmount(0);
    setQortRecipient('');
    setOpenQortSend(true);
  }

  const handleCloseQortSend = () => {
    setQortAmount(0);
    setQortRecipient('');
    setOpenQortSend(false);
  }

  const handleCloseSendQortSuccess = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendQortSuccess(false);
  };

  const handleCloseSendQortError = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSendQortError(false);
  };

  const handleSendMaxQort = () => {
    let maxQortAmount = 0;
    let WalletBalanceQort = parseFloat(walletBalanceQort)
    maxQortAmount = WalletBalanceQort - 0.01100000;
    if (maxQortAmount <= 0) {
      setQortAmount(0);
    } else {
      setQortAmount(maxQortAmount);
    }
  }

  const validateCanSendQortAmount = async (qAmount: number) => {
    let checkAmount = 0;
    checkAmount = qAmount;
    setQortAmount(checkAmount);
    if (checkAmount <= 0 || null || !checkAmount) {
      setSendDisabled(true);
    } else if (qortRecipient.length < 3 || qortRecipient === '') {
      setSendDisabled(true);
    } else {
      setSendDisabled(false);
    }
  }

  const validateCanSendQortAddress = async (qRecipient: string) => {
    let checkRecipient = '';
    checkRecipient = qRecipient;
    setQortRecipient(checkRecipient);
    if (qortAmount <= 0 || null || !qortAmount) {
      setSendDisabled(true);
    } else if (qRecipient.length < 3 || qRecipient === '') {
      setSendDisabled(true);
    } else if (qRecipient.length >= 3) {
      const addressUrl = `/addresses/${checkRecipient}`;
      const nameUrl = `/names/${checkRecipient}`;
      const addressUrlResult = await fetch(addressUrl);
      const addressUrlResponse = await addressUrlResult.json();
      const nameUrlResult = await fetch(nameUrl);
      const nameUrlResponse = await nameUrlResult.json();
      if (!addressUrlResponse?.error) {
        setSendDisabled(false);
      } else if (!nameUrlResponse?.error) {
        setSendDisabled(false);
      } else {
        setSendDisabled(true);
      }
    } else {
      setSendDisabled(false);
    }
  }

  const getQortalTransactions = async () => {
    setLoadingRefreshQort(true);

    const paymentLink = `/transactions/search?txType=PAYMENT&address=${userInfo?.address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;
    const pendingPaymentLink = `/transactions/unconfirmed?txType=PAYMENT&creator=${userInfo?.address}&limit=0&reverse=true`;
    const arbitraryLink = `/transactions/search?txType=ARBITRARY&address=${userInfo?.address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;
    const pendingArbitraryLink = `/transactions/unconfirmed?txType=ARBITRARY&creator=${userInfo?.address}&limit=0&reverse=true`;
    const atLink = `/transactions/search?txType=AT&txType=DEPLOY_AT&txType=MESSAGE&address=${userInfo?.address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;
    const pendingAtLink = `/transactions/unconfirmed?txType=AT&txType=DEPLOY_AT&txType=MESSAGE&creator=${userInfo?.address}&limit=0&reverse=true`;
    const groupLink = `/transactions/search?txType=CREATE_GROUP&txType=UPDATE_GROUP&txType=ADD_GROUP_ADMIN&txType=REMOVE_GROUP_ADMIN&txType=GROUP_BAN&txType=CANCEL_GROUP_BAN&txType=GROUP_KICK&txType=GROUP_INVITE&txType=CANCEL_GROUP_INVITE&txType=JOIN_GROUP&txType=LEAVE_GROUP&txType=GROUP_APPROVAL&txType=SET_GROUP&address=${userInfo?.address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;
    const pendingGroupLink = `/transactions/unconfirmed?txType=CREATE_GROUP&txType=UPDATE_GROUP&txType=ADD_GROUP_ADMIN&txType=REMOVE_GROUP_ADMIN&txType=GROUP_BAN&txType=CANCEL_GROUP_BAN&txType=GROUP_KICK&txType=GROUP_INVITE&txType=CANCEL_GROUP_INVITE&txType=JOIN_GROUP&txType=LEAVE_GROUP&txType=GROUP_APPROVAL&txType=SET_GROUP&creator=${userInfo?.address}&limit=0&reverse=true`;
    const nameLink = `/transactions/search?txType=REGISTER_NAME&txType=UPDATE_NAME&txType=SELL_NAME&txType=CANCEL_SELL_NAME&txType=BUY_NAME&address=${userInfo?.address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;
    const pendingNameLink = `/transactions/unconfirmed?txType=REGISTER_NAME&txType=UPDATE_NAME&txType=SELL_NAME&txType=CANCEL_SELL_NAME&txType=BUY_NAME&creator=${userInfo?.address}&limit=0&reverse=true`;
    const assetLink = `/transactions/search?txType=ISSUE_ASSET&txType=TRANSFER_ASSET&address=${userInfo?.address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;
    const pendingAssetLink = `/transactions/unconfirmed?txType=ISSUE_ASSET&txType=TRANSFER_ASSET&creator=${userInfo?.address}&limit=0&reverse=true`;
    const pollLink = `/transactions/search?txType=CREATE_POLL&txType=VOTE_ON_POLL&address=${userInfo?.address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;
    const pendingPollLink = `/transactions/unconfirmed?txType=CREATE_POLL&txType=VOTE_ON_POLL&creator=${userInfo?.address}&limit=0&reverse=true`;
    const rewardshareLink = `/transactions/search?txType=REWARD_SHARE&txType=TRANSFER_PRIVS&txType=PRESENCE&address=${userInfo?.address}&confirmationStatus=CONFIRMED&limit=0&reverse=true`;
    const pendingRewardshareLink = `/transactions/unconfirmed?txType=REWARD_SHARE&txType=TRANSFER_PRIVS&txType=PRESENCE&creator=${userInfo?.address}&limit=0&reverse=true`;

    const compareFn = (a: { timestamp: number; }, b: { timestamp: number; }) => {
      return b.timestamp - a.timestamp
    }

    const fetchPayment = async () => {
      const paymentResponse = await fetch(paymentLink);
      const pendingPaymentResponse = await fetch(pendingPaymentLink);
      const paymentResult = await paymentResponse.json();
      const pendingPaymentResult = await pendingPaymentResponse.json();
      const allPayment = paymentResult.concat(pendingPaymentResult);
      const allPaymentSorted = allPayment.sort(compareFn);
      return setPaymentInfo(allPaymentSorted);
    }

    const fetchArbitrary = async () => {
      const arbitraryResponse = await fetch(arbitraryLink);
      const pendingArbitraryResponse = await fetch(pendingArbitraryLink);
      const arbitraryResult = await arbitraryResponse.json();
      const pendingArbitraryResult = await pendingArbitraryResponse.json();
      const allArbitrary = arbitraryResult.concat(pendingArbitraryResult);
      const allArbitrarySorted = allArbitrary.sort(compareFn);
      return setArbitraryInfo(allArbitrarySorted);
    }

    const fetchAt = async () => {
      const atResponse = await fetch(atLink);
      const pendingAtResponse = await fetch(pendingAtLink);
      const atResult = await atResponse.json();
      const pendingAtResult = await pendingAtResponse.json();
      const allAt = atResult.concat(pendingAtResult);
      const allAtSorted = allAt.sort(compareFn);
      return setAtInfo(allAtSorted);
    }

    const fetchGroup = async () => {
      const groupResponse = await fetch(groupLink);
      const pendingGroupResponse = await fetch(pendingGroupLink);
      const groupResult = await groupResponse.json();
      const pendingGroupResult = await pendingGroupResponse.json();
      const allGroup = groupResult.concat(pendingGroupResult);
      const allGroupSorted = allGroup.sort(compareFn);
      return setGroupInfo(allGroupSorted);
    }

    const fetchName = async () => {
      const nameResponse = await fetch(nameLink);
      const pendingNameResponse = await fetch(pendingNameLink);
      const nameResult = await nameResponse.json();
      const pendingNameResult = await pendingNameResponse.json();
      const allName = nameResult.concat(pendingNameResult);
      const allNameSorted = allName.sort(compareFn);
      return setNameInfo(allNameSorted);
    }

    const fetchAsset = async () => {
      const assetResponse = await fetch(assetLink);
      const pendingAssetResponse = await fetch(pendingAssetLink);
      const assetResult = await assetResponse.json();
      const pendingAssetResult = await pendingAssetResponse.json();
      const allAsset = assetResult.concat(pendingAssetResult);
      const allAssetSorted = allAsset.sort(compareFn);
      return setAssetInfo(allAssetSorted);
    }

    const fetchPoll = async () => {
      const pollResponse = await fetch(pollLink);
      const pendingPollResponse = await fetch(pendingPollLink);
      const pollResult = await pollResponse.json();
      const pendingPollResult = await pendingPollResponse.json();
      const allPoll = pollResult.concat(pendingPollResult);
      const allPollSorted = allPoll.sort(compareFn);
      return setPollInfo(allPollSorted);
    }

    const fetchRewardshare = async () => {
      const rewardshareResponse = await fetch(rewardshareLink);
      const pendingRewardshareResponse = await fetch(pendingRewardshareLink);
      const rewardshareResult = await rewardshareResponse.json();
      const pendingRewardshareResult = await pendingRewardshareResponse.json();
      const allRewardshare = rewardshareResult.concat(pendingRewardshareResult);
      const allRewardshareSorted = allRewardshare.sort(compareFn);
      return setRewardshareInfo(allRewardshareSorted);
    }

    const fetchPromises = [
      fetchPayment(),
      fetchArbitrary(),
      fetchAt(),
      fetchGroup(),
      fetchName(),
      fetchAsset(),
      fetchPoll(),
      fetchRewardshare()
    ];

    const resolveAll = await Promise.all(fetchPromises);

    resolveAll;

    setLoadingRefreshQort(false);
  }

  const handleLoadingRefreshQort = async () => {
    await getQortalTransactions();
  }

  const getWalletBalanceQort = async () => {
    try {
      const balanceLink = `/addresses/balance/${userInfo?.address}`;
      const response = await fetch(balanceLink);
      const data = await response.json();
      setWalletBalanceQort(data);
    } catch (error) {
      console.error(error)
    }

  }

  React.useEffect(() => {
    if (!userInfo?.address) return;
    const intervalGetWalletBalance = setInterval(() => {
      getWalletBalanceQort();
    }, 60000);
    getWalletBalanceQort();
    return () => {
      clearInterval(intervalGetWalletBalance);
    }
  }, [userInfo?.address]);

  React.useEffect(() => {
    if (!userInfo?.address) return;
    getQortalTransactions();
  }, [userInfo?.address]);

  const sendQortRequest = async () => {
    setOpenTxQortSubmit(true);
    try {
      const sendRequest = await qortalRequest({
        action: "SEND_COIN",
        coin: "QORT",
        recipient: qortRecipient,
        amount: qortAmount,
      });
      if (!sendRequest?.error) {
        setQortAmount(0);
        setQortRecipient('');
        setOpenTxQortSubmit(false);
        setOpenSendQortSuccess(true);
        await timeoutDelay(3000);
        getWalletBalanceQort();
        getQortalTransactions();
      }
    } catch (error) {
      setQortAmount(0);
      setQortRecipient('');
      setOpenTxQortSubmit(false);
      setOpenSendQortError(true);
      await timeoutDelay(3000);
      getWalletBalanceQort();
      getQortalTransactions();
      console.error("ERROR SENDING QORT", error);
    }
  }

  const QortQrDialogPage = () => {
    return (
      <DialogGeneral
        onClose={handleCloseQortQR}
        aria-labelledby="btc-qr-code"
        open={openQortQR}
        keepMounted={false}
      >
        <DialogTitle sx={{ m: 0, p: 2, fontSize: '12px' }} id="btc-qr-code">
          Address : {userInfo?.address}
        </DialogTitle>
        <DialogContent dividers>
          <div style={{ height: "auto", margin: "0 auto", maxWidth: 256, width: "100%" }}>
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={userInfo?.address}
              viewBox={`0 0 256 256`}
              fgColor={'#393939'}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseQortQR}>
            CLOSE
          </Button>
        </DialogActions>
      </DialogGeneral>
    );
  }

  const QortAddressBookDialogPage = () => {
    return (
      <DialogGeneral
        aria-labelledby="btc-electrum-servers"
        open={openQortAddressBook}
        keepMounted={false}
      >
        <DialogContent>
          <Typography
            variant="h5"
            align="center"
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            Coming soon...
          </Typography>
        </DialogContent>
      </DialogGeneral>
    );
  }

  const tablePayment = () => {
    if (paymentInfo && paymentInfo.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table stickyHeader sx={{ width: '100%' }} aria-label="payments-table" >
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">Status</StyledTableCell>
                <StyledTableCell align="left">Type</StyledTableCell>
                <StyledTableCell align="left">Creator</StyledTableCell>
                <StyledTableCell align="left">Recipient</StyledTableCell>
                <StyledTableCell align="left">Amount QORT</StyledTableCell>
                <StyledTableCell align="left">Fee QORT</StyledTableCell>
                <StyledTableCell align="left">Time</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? paymentInfo.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : paymentInfo
              ).map((row: {
                type: string;
                timestamp: number;
                reference: string;
                fee: number;
                signature: string;
                txGroupId: number;
                recipient: string;
                blockHeight: number;
                approvalStatus: string;
                creatorAddress: string;
                senderPublicKey: string;
                amount: number;
              }, a: React.Key) => (
                <StyledTableRow key={a}>
                  <StyledTableCell style={{ width: 'auto' }} align="center">
                    {(() => {
                      if ((nodeInfo?.height - row?.blockHeight) < 3) {
                        return <Tooltip placement="top" title={(nodeInfo?.height - row?.blockHeight) + " / 3 confirmations"}><HistoryToggleOff style={{ fontSize: "15px", color: "#f44336", marginTop: "2px" }} /></Tooltip>;
                      } else {
                        return <Tooltip placement="top" title={(nodeInfo?.height - row?.blockHeight) + " confirmations"}><CheckCircleOutline style={{ fontSize: "15px", color: "#66bb6a", marginTop: "2px" }} /></Tooltip>;
                      }
                    })()}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.type}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.creatorAddress === userInfo?.address ?
                      <div style={{ color: '#05a2e4' }}>{row?.creatorAddress}</div> : row?.creatorAddress
                    }
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.recipient === userInfo?.address ?
                      <div style={{ color: '#05a2e4' }}>{row?.recipient}</div> : row?.recipient
                    }
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.recipient === userInfo?.address ?
                      <div style={{ color: '#66bb6a' }}>+ {row?.amount}</div> : <div style={{ color: '#f44336' }}>- {row?.amount}</div>
                    }
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.fee}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    <CustomWidthTooltip placement="top" title={new Date(row?.timestamp).toLocaleString()}>
                      <div>{epochToAgo(row?.timestamp)}</div>
                    </CustomWidthTooltip>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {emptyRowsPayment > 0 && (
                <TableRow style={{ height: 53 * emptyRowsPayment }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter sx={{ width: "100%" }}>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                  colSpan={7}
                  count={paymentInfo.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  slotProps={{
                    select: {
                      inputProps: {
                        'aria-label': 'rows per page',
                      },
                      native: true,
                    },
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      );
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          No Payment Transactions Yet...
        </Typography>
      );
    }
  }

  const tableArbitrary = () => {
    if (arbitraryInfo && arbitraryInfo.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table stickyHeader sx={{ width: '100%' }} aria-label="arbitrary-table" >
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">Status</StyledTableCell>
                <StyledTableCell align="left">Type</StyledTableCell>
                <StyledTableCell align="left">Creator</StyledTableCell>
                <StyledTableCell align="left">Identifier</StyledTableCell>
                <StyledTableCell align="left">Size</StyledTableCell>
                <StyledTableCell align="left">Fee QORT</StyledTableCell>
                <StyledTableCell align="left">Time</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? arbitraryInfo.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : arbitraryInfo
              ).map((row: {
                blockHeight: number;
                type: string;
                creatorAddress: string;
                identifier: string;
                size: number;
                fee: number;
                timestamp: number;
              }, b: React.Key) => (
                <StyledTableRow key={b}>
                  <StyledTableCell style={{ width: 'auto' }} align="center">
                    {(() => {
                      if ((nodeInfo?.height - row?.blockHeight) < 3) {
                        return <Tooltip placement="top" title={(nodeInfo?.height - row?.blockHeight) + " / 3 confirmations"}><HistoryToggleOff style={{ fontSize: "15px", color: "#f44336", marginTop: "2px" }} /></Tooltip>;
                      } else {
                        return <Tooltip placement="top" title={(nodeInfo?.height - row?.blockHeight) + " confirmations"}><CheckCircleOutline style={{ fontSize: "15px", color: "#66bb6a", marginTop: "2px" }} /></Tooltip>;
                      }
                    })()}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.type}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.creatorAddress === userInfo?.address ?
                      <div style={{ color: '#05a2e4' }}>{row?.creatorAddress}</div> : row?.creatorAddress
                    }
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.identifier}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    <div style={{ color: '#66bb6a' }}>{humanFileSize(row?.size, true, 2)}</div>
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.fee}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    <CustomWidthTooltip placement="top" title={new Date(row?.timestamp).toLocaleString()}>
                      <div>{epochToAgo(row?.timestamp)}</div>
                    </CustomWidthTooltip>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {emptyRowsArbitrary > 0 && (
                <TableRow style={{ height: 53 * emptyRowsArbitrary }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter sx={{ width: "100%" }}>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                  colSpan={7}
                  count={arbitraryInfo.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  slotProps={{
                    select: {
                      inputProps: {
                        'aria-label': 'rows per page',
                      },
                      native: true,
                    },
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      );
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          No Arbitrary Transactions Yet...
        </Typography>
      );
    }
  }

  const tableAt = () => {
    if (atInfo && atInfo.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table stickyHeader sx={{ width: '100%' }} aria-label="at-table" >
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">Status</StyledTableCell>
                <StyledTableCell align="left">Type</StyledTableCell>
                <StyledTableCell align="left">Creator</StyledTableCell>
                <StyledTableCell align="left">Recipient</StyledTableCell>
                <StyledTableCell align="left">Amount QORT</StyledTableCell>
                <StyledTableCell align="left">Fee QORT</StyledTableCell>
                <StyledTableCell align="left">Time</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? atInfo.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : atInfo
              ).map((row: {
                blockHeight: number;
                type: string;
                creatorAddress: string;
                recipient: string;
                description: string | "";
                amount: number;
                fee: number;
                timestamp: number;
              }, c: React.Key) => (
                <StyledTableRow key={c}>
                  <StyledTableCell style={{ width: 'auto' }} align="center">
                    {(() => {
                      if ((nodeInfo?.height - row?.blockHeight) < 3) {
                        return <Tooltip placement="top" title={(nodeInfo?.height - row?.blockHeight) + " / 3 confirmations"}><HistoryToggleOff style={{ fontSize: "15px", color: "#f44336", marginTop: "2px" }} /></Tooltip>;
                      } else {
                        return <Tooltip placement="top" title={(nodeInfo?.height - row?.blockHeight) + " confirmations"}><CheckCircleOutline style={{ fontSize: "15px", color: "#66bb6a", marginTop: "2px" }} /></Tooltip>;
                      }
                    })()}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.type}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.creatorAddress === userInfo?.address ?
                      <div style={{ color: '#05a2e4' }}>{row?.creatorAddress}</div> : row?.creatorAddress
                    }
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {(() => {
                      if (row?.recipient) {
                        if (row?.recipient === userInfo?.address) {
                          return <div style={{ color: '#05a2e4' }}>{row?.recipient}</div>;
                        } else {
                          return row?.recipient;
                        }
                      } else if (row?.description) {
                        return row?.description;
                      } else {
                        return "";
                      }
                    })()}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.recipient === userInfo?.address ?
                      <div style={{ color: '#66bb6a' }}>+ {row?.amount}</div> : <div style={{ color: '#f44336' }}>- {row?.amount}</div>
                    }
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.fee}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    <CustomWidthTooltip placement="top" title={new Date(row?.timestamp).toLocaleString()}>
                      <div>{epochToAgo(row?.timestamp)}</div>
                    </CustomWidthTooltip>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {emptyRowsAt > 0 && (
                <TableRow style={{ height: 53 * emptyRowsAt }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter sx={{ width: "100%" }}>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                  colSpan={7}
                  count={atInfo.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  slotProps={{
                    select: {
                      inputProps: {
                        'aria-label': 'rows per page',
                      },
                      native: true,
                    },
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      );
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          No AT Transactions Yet...
        </Typography>
      );
    }
  }

  const tableGroup = () => {
    if (groupInfo && groupInfo.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table stickyHeader sx={{ width: '100%' }} aria-label="group-table" >
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">Status</StyledTableCell>
                <StyledTableCell align="left">Type</StyledTableCell>
                <StyledTableCell align="left">Creator</StyledTableCell>
                <StyledTableCell align="left">Info</StyledTableCell>
                <StyledTableCell align="left">Fee QORT</StyledTableCell>
                <StyledTableCell align="left">Time</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? groupInfo.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : groupInfo
              ).map((row: {
                blockHeight: number;
                groupId: number;
                invitee: string;
                newDescription: string;
                groupName: string;
                member: string;
                offender: string;
                admin: string;
                reference: string;
                type: string;
                creatorAddress: string;
                fee: number;
                timestamp: number;
              }, d: React.Key) => (
                <StyledTableRow key={d}>
                  <StyledTableCell style={{ width: 'auto' }} align="center">
                    {(() => {
                      if ((nodeInfo?.height - row?.blockHeight) < 3) {
                        return <Tooltip placement="top" title={(nodeInfo?.height - row?.blockHeight) + " / 3 confirmations"}><HistoryToggleOff style={{ fontSize: "15px", color: "#f44336", marginTop: "2px" }} /></Tooltip>;
                      } else {
                        return <Tooltip placement="top" title={(nodeInfo?.height - row?.blockHeight) + " confirmations"}><CheckCircleOutline style={{ fontSize: "15px", color: "#66bb6a", marginTop: "2px" }} /></Tooltip>;
                      }
                    })()}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.type}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.creatorAddress === userInfo?.address ?
                      <div style={{ color: '#05a2e4' }}>{row?.creatorAddress}</div> : row?.creatorAddress
                    }
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {(() => {
                      if (row?.type === "CREATE_GROUP") {
                        return "Group name: " + row?.groupName + " ID: " + row?.groupId;
                      } else if (row?.type === "UPDATE_GROUP") {
                        return "New description: " + row?.newDescription + " ID: " + row?.groupId;
                      } else if (row?.type === "ADD_GROUP_ADMIN") {
                        return "New admin: " + row?.member + " ID: " + row?.groupId;
                      } else if (row?.type === "REMOVE_GROUP_ADMIN") {
                        return "Removed admin: " + row?.admin + " ID: " + row?.groupId;
                      } else if (row?.type === "GROUP_BAN") {
                        return "Banned: " + row?.offender + " ID: " + row?.groupId;
                      } else if (row?.type === "CANCEL_GROUP_BAN") {
                        return "Unbanned: " + row?.member + " ID: " + row?.groupId;
                      } else if (row?.type === "GROUP_KICK") {
                        return "Kicked: " + row?.member + " ID: " + row?.groupId;
                      } else if (row?.type === "GROUP_INVITE") {
                        if (row?.invitee === userInfo?.address) {
                          return <div>Invitee:<span style={{ color: '#05a2e4', marginLeft: '5px', marginRight: '5px' }}>{row?.invitee}</span>ID: {row?.groupId}</div>;
                        } else {
                          return "Invitee: " + row?.invitee + " ID: " + row?.groupId;
                        }
                      } else if (row?.type === "CANCEL_GROUP_INVITE") {
                        return "REF: " + row?.reference;
                      } else if (row?.type === "JOIN_GROUP") {
                        return "Joined Group ID: " + row?.groupId;
                      } else if (row?.type === "LEAVE_GROUP") {
                        return "Leaved Group ID: " + row?.groupId;
                      } else if (row?.type === "GROUP_APPROVAL") {
                        return "REF: " + row?.reference
                      } else if (row?.type === "SET_GROUP") {
                        return ""
                      }
                    })()}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.fee}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    <CustomWidthTooltip placement="top" title={new Date(row?.timestamp).toLocaleString()}>
                      <div>{epochToAgo(row?.timestamp)}</div>
                    </CustomWidthTooltip>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {emptyRowsGroup > 0 && (
                <TableRow style={{ height: 53 * emptyRowsGroup }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter sx={{ width: "100%" }}>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                  colSpan={6}
                  count={groupInfo.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  slotProps={{
                    select: {
                      inputProps: {
                        'aria-label': 'rows per page',
                      },
                      native: true,
                    },
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer >
      );
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          No Group Transactions Yet...
        </Typography>
      );
    }
  }

  const tableName = () => {
    if (nameInfo && nameInfo.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table stickyHeader sx={{ width: '100%' }} aria-label="group-table" >
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">Status</StyledTableCell>
                <StyledTableCell align="left">Type</StyledTableCell>
                <StyledTableCell align="left">Creator</StyledTableCell>
                <StyledTableCell align="left">Info</StyledTableCell>
                <StyledTableCell align="left">Fee QORT</StyledTableCell>
                <StyledTableCell align="left">Time</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? nameInfo.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : nameInfo
              ).map((row: {
                blockHeight: number;
                type: string;
                creatorAddress: string;
                name: string;
                newName: string;
                seller: string;
                amount: number;
                fee: number;
                timestamp: number;
              }, e: React.Key) => (
                <StyledTableRow key={e}>
                  <StyledTableCell style={{ width: 'auto' }} align="center">
                    {(() => {
                      if ((nodeInfo?.height - row?.blockHeight) < 3) {
                        return <Tooltip placement="top" title={(nodeInfo?.height - row?.blockHeight) + " / 3 confirmations"}><HistoryToggleOff style={{ fontSize: "15px", color: "#f44336", marginTop: "2px" }} /></Tooltip>;
                      } else {
                        return <Tooltip placement="top" title={(nodeInfo?.height - row?.blockHeight) + " confirmations"}><CheckCircleOutline style={{ fontSize: "15px", color: "#66bb6a", marginTop: "2px" }} /></Tooltip>;
                      }
                    })()}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.type}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.creatorAddress === userInfo?.address ?
                      <div style={{ color: '#05a2e4' }}>{row?.creatorAddress}</div> : row?.creatorAddress
                    }
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {(() => {
                      if (row?.type === "REGISTER_NAME") {
                        return "Registered name: " + row?.name;
                      } else if (row?.type === "UPDATE_NAME") {
                        return "Old name: " + row?.name + " New name: " + row?.newName;
                      } else if (row?.type === "SELL_NAME") {
                        return "Name to sell: " + row?.name + " Amount QORT: " + row?.amount;
                      } else if (row?.type === "CANCEL_SELL_NAME") {
                        return "Cancelled name to sell: " + row?.name;
                      } else if (row?.type === "BUY_NAME") {
                        return "Seller: " + row?.seller + " Amount QORT: " + row?.amount;
                      }
                    })()}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.fee}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    <CustomWidthTooltip placement="top" title={new Date(row?.timestamp).toLocaleString()}>
                      <div>{epochToAgo(row?.timestamp)}</div>
                    </CustomWidthTooltip>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {emptyRowsName > 0 && (
                <TableRow style={{ height: 53 * emptyRowsName }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter sx={{ width: "100%" }}>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                  colSpan={6}
                  count={nameInfo.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  slotProps={{
                    select: {
                      inputProps: {
                        'aria-label': 'rows per page',
                      },
                      native: true,
                    },
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer >
      );
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          No Name Transactions Yet...
        </Typography>
      );
    }
  }

  const tableAsset = () => {
    if (assetInfo && assetInfo.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table stickyHeader sx={{ width: '100%' }} aria-label="group-table" >
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">Status</StyledTableCell>
                <StyledTableCell align="left">Type</StyledTableCell>
                <StyledTableCell align="left">Creator</StyledTableCell>
                <StyledTableCell align="left">Recipent / Desc.</StyledTableCell>
                <StyledTableCell align="left">Amount / QTY</StyledTableCell>
                <StyledTableCell align="left">Fee QORT</StyledTableCell>
                <StyledTableCell align="left">Time</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? assetInfo.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : assetInfo
              ).map((row: {
                blockHeight: number;
                type: string;
                fee: number;
                timestamp: number;
                creatorAddress: string;
                recipient: string;
                amount: number;
                assetName: string;
                quantity: number;
                description: string;
              }, f: React.Key) => (
                <StyledTableRow key={f}>
                  <StyledTableCell style={{ width: 'auto' }} align="center">
                    {(() => {
                      if ((nodeInfo?.height - row?.blockHeight) < 3) {
                        return <Tooltip placement="top" title={(nodeInfo?.height - row?.blockHeight) + " / 3 confirmations"}><HistoryToggleOff style={{ fontSize: "15px", color: "#f44336", marginTop: "2px" }} /></Tooltip>;
                      } else {
                        return <Tooltip placement="top" title={(nodeInfo?.height - row?.blockHeight) + " confirmations"}><CheckCircleOutline style={{ fontSize: "15px", color: "#66bb6a", marginTop: "2px" }} /></Tooltip>;
                      }
                    })()}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.type}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.creatorAddress === userInfo?.address ?
                      <div style={{ color: '#05a2e4' }}>{row?.creatorAddress}</div> : row?.creatorAddress
                    }
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {(() => {
                      if (row?.type === "TRANSFER_ASSET") {
                        return row?.recipient === userInfo?.address ? <div style={{ color: '#05a2e4' }}>{row?.recipient}</div> : row?.recipient;
                      } else if (row?.type === "ISSUE_ASSET") {
                        return "Asset name: " + row?.assetName;
                      }
                    })()}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.amount ? row?.amount : row?.quantity}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.fee}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    <CustomWidthTooltip placement="top" title={new Date(row?.timestamp).toLocaleString()}>
                      <div>{epochToAgo(row?.timestamp)}</div>
                    </CustomWidthTooltip>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {emptyRowsAsset > 0 && (
                <TableRow style={{ height: 53 * emptyRowsAsset }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter sx={{ width: "100%" }}>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                  colSpan={7}
                  count={assetInfo.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  slotProps={{
                    select: {
                      inputProps: {
                        'aria-label': 'rows per page',
                      },
                      native: true,
                    },
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer >
      );
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          No Asset Transactions Yet...
        </Typography>
      );
    }
  }

  const tablePoll = () => {
    if (pollInfo && pollInfo.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table stickyHeader sx={{ width: '100%' }} aria-label="group-table" >
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">Status</StyledTableCell>
                <StyledTableCell align="left">Type</StyledTableCell>
                <StyledTableCell align="left">Creator</StyledTableCell>
                <StyledTableCell align="left">Poll Name</StyledTableCell>
                <StyledTableCell align="left">Fee QORT</StyledTableCell>
                <StyledTableCell align="left">Time</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? pollInfo.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : pollInfo
              ).map((row: {
                blockHeight: number;
                type: string;
                fee: number;
                timestamp: number;
                creatorAddress: string;
                pollName: string;
              }, g: React.Key) => (
                <StyledTableRow key={g}>
                  <StyledTableCell style={{ width: 'auto' }} align="center">
                    {(() => {
                      if ((nodeInfo?.height - row?.blockHeight) < 3) {
                        return <Tooltip placement="top" title={(nodeInfo?.height - row?.blockHeight) + " / 3 confirmations"}><HistoryToggleOff style={{ fontSize: "15px", color: "#f44336", marginTop: "2px" }} /></Tooltip>;
                      } else {
                        return <Tooltip placement="top" title={(nodeInfo?.height - row?.blockHeight) + " confirmations"}><CheckCircleOutline style={{ fontSize: "15px", color: "#66bb6a", marginTop: "2px" }} /></Tooltip>;
                      }
                    })()}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.type}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.creatorAddress === userInfo?.address ?
                      <div style={{ color: '#05a2e4' }}>{row?.creatorAddress}</div> : row?.creatorAddress
                    }
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.pollName}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.fee}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    <CustomWidthTooltip placement="top" title={new Date(row?.timestamp).toLocaleString()}>
                      <div>{epochToAgo(row?.timestamp)}</div>
                    </CustomWidthTooltip>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {emptyRowsPoll > 0 && (
                <TableRow style={{ height: 53 * emptyRowsPoll }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter sx={{ width: "100%" }}>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                  colSpan={6}
                  count={pollInfo.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  slotProps={{
                    select: {
                      inputProps: {
                        'aria-label': 'rows per page',
                      },
                      native: true,
                    },
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer >
      );
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          No Poll Transactions Yet...
        </Typography>
      );
    }
  }

  const tableRewardshare = () => {
    if (rewardshareInfo && rewardshareInfo.length > 0) {
      return (
        <TableContainer component={Paper}>
          <Table stickyHeader sx={{ width: '100%' }} aria-label="payments-table" >
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">Status</StyledTableCell>
                <StyledTableCell align="left">Type</StyledTableCell>
                <StyledTableCell align="left">Creator</StyledTableCell>
                <StyledTableCell align="left">Recipient</StyledTableCell>
                <StyledTableCell align="left">Info</StyledTableCell>
                <StyledTableCell align="left">Fee QORT</StyledTableCell>
                <StyledTableCell align="left">Time</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? rewardshareInfo.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : rewardshareInfo
              ).map((row: {
                blockHeight: number;
                type: string;
                fee: number;
                timestamp: number;
                creatorAddress: string;
                recipient: string;
                rewardSharePublicKey: string;
                sharePercent: string;
              }, h: React.Key) => (
                <StyledTableRow key={h}>
                  <StyledTableCell style={{ width: 'auto' }} align="center">
                    {(() => {
                      if ((nodeInfo?.height - row?.blockHeight) < 3) {
                        return <Tooltip placement="top" title={(nodeInfo?.height - row?.blockHeight) + " / 3 confirmations"}><HistoryToggleOff style={{ fontSize: "15px", color: "#f44336", marginTop: "2px" }} /></Tooltip>;
                      } else {
                        return <Tooltip placement="top" title={(nodeInfo?.height - row?.blockHeight) + " confirmations"}><CheckCircleOutline style={{ fontSize: "15px", color: "#66bb6a", marginTop: "2px" }} /></Tooltip>;
                      }
                    })()}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.type}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.creatorAddress === userInfo?.address ?
                      <div style={{ color: '#05a2e4' }}>{row?.creatorAddress}</div> : row?.creatorAddress
                    }
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.recipient === userInfo?.address ?
                      <div style={{ color: '#05a2e4' }}>{row?.recipient}</div> : row?.recipient
                    }
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.sharePercent.startsWith('-') ?
                      <div style={{ color: '#f44336', display: 'flex', alignItems: 'center' }}>
                        Removed
                        <CustomWidthTooltip placement="top" title={row?.recipient === row?.creatorAddress ? "Minting Key: " + row?.rewardSharePublicKey : "Sponsor Key: " + row?.rewardSharePublicKey}>
                          <InfoOutlined style={{ fontSize: '14px', color: '#05a2e4', marginLeft: '8px' }} />
                        </CustomWidthTooltip>
                      </div>
                      :
                      <div style={{ color: '#66bb6a', display: 'flex', alignItems: 'center' }}>
                        Created
                        <CustomWidthTooltip placement="top" title={row?.recipient === row?.creatorAddress ? "Minting Key: " + row?.rewardSharePublicKey : "Sponsor Key: " + row?.rewardSharePublicKey}>
                          <InfoOutlined style={{ fontSize: '14px', color: '#05a2e4', marginLeft: '8px' }} />
                        </CustomWidthTooltip>
                      </div>
                    }
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    {row?.fee}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: 'auto' }} align="left">
                    <CustomWidthTooltip placement="top" title={new Date(row?.timestamp).toLocaleString()}>
                      <div>{epochToAgo(row?.timestamp)}</div>
                    </CustomWidthTooltip>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {emptyRowsRewardshare > 0 && (
                <TableRow style={{ height: 53 * emptyRowsRewardshare }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter sx={{ width: "100%" }}>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                  colSpan={7}
                  count={rewardshareInfo.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  slotProps={{
                    select: {
                      inputProps: {
                        'aria-label': 'rows per page',
                      },
                      native: true,
                    },
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      );
    } else {
      return (
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 700 }}
        >
          No Rewardshare Transactions Yet...
        </Typography>
      );
    }
  }

  const qortalTables = () => {
    return (
      <Box sx={{ width: '100%' }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Qortal Transactions"
            >
              <Tab label={<span style={{ fontSize: '14px' }}>PAYMENT</span>} value="One" />
              <Tab label={<span style={{ fontSize: '14px' }}>ARBITRARY</span>} value="Two" />
              <Tab label={<span style={{ fontSize: '14px' }}>AT</span>} value="Three" />
              <Tab label={<span style={{ fontSize: '14px' }}>GROUP</span>} value="Four" />
              <Tab label={<span style={{ fontSize: '14px' }}>NAME</span>} value="Five" />
              <Tab label={<span style={{ fontSize: '14px' }}>ASSET</span>} value="Six" />
              <Tab label={<span style={{ fontSize: '14px' }}>POLL</span>} value="Seven" />
              <Tab label={<span style={{ fontSize: '14px' }}>REWARDSHARE</span>} value="Eight" />
            </TabList>
          </Box>
          <TabPanel value="One">{tablePayment()}</TabPanel>
          <TabPanel value="Two">{tableArbitrary()}</TabPanel>
          <TabPanel value="Three">{tableAt()}</TabPanel>
          <TabPanel value="Four">{tableGroup()}</TabPanel>
          <TabPanel value="Five">{tableName()}</TabPanel>
          <TabPanel value="Six">{tableAsset()}</TabPanel>
          <TabPanel value="Seven">{tablePoll()}</TabPanel>
          <TabPanel value="Eight">{tableRewardshare()}</TabPanel>
        </TabContext>
      </Box>
    );
  }

  const tableLoader = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{
          width: "100%",
          display: 'flex',
          justifyContent: 'center'
        }}>
          <CircularProgress />
        </div>
        <div style={{
          width: "100%",
          display: 'flex',
          justifyContent: 'center',
          marginTop: '20px'
        }}>
          <Typography variant="h5" sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 700 }}>
            Loading Transactions Please Wait...
          </Typography>
        </div>
      </Box>
    );
  }

  const QortSendDialogPage = () => {
    return (
      <Dialog
        fullScreen
        open={openQortSend}
        onClose={handleCloseQortSend}
        slots={{ transition: Transition }}
      >
        <QortSubmittDialog
          fullWidth={true}
          maxWidth='xs'
          open={openTxQortSubmit}
        >
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{
                width: "100%",
                display: 'flex',
                justifyContent: 'center'
              }}>
                <CircularProgress color="success" size={64} />
              </div>
              <div style={{
                width: "100%",
                display: 'flex',
                justifyContent: 'center',
                marginTop: '20px'
              }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 700 }}>
                  Processing Transaction Please Wait...
                </Typography>
              </div>
            </Box>
          </DialogContent>
        </QortSubmittDialog>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={openSendQortSuccess}
          autoHideDuration={4000}
          slots={{ transition: SlideTransition }}
          onClose={handleCloseSendQortSuccess}>
          <Alert
            onClose={handleCloseSendQortSuccess}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            Sent QORT transaction was successful!
          </Alert>
        </Snackbar>
        <Snackbar open={openSendQortError} autoHideDuration={4000} onClose={handleCloseSendQortError}>
          <Alert
            onClose={handleCloseSendQortError}
            severity="error"
            variant="filled"
            sx={{ width: '100%' }}
          >
            Something went wrong, please try again!
          </Alert>
        </Snackbar>
        <AppBar sx={{ position: 'static' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseQortSend}
              aria-label="close"
            >
              <Close />
            </IconButton>
            <Avatar sx={{ width: 28, height: 28 }} alt="ARRR Logo" src={coinLogoQORT} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1, display: { xs: 'none', sm: 'block', paddingLeft: '10px', paddingTop: '3px' }
              }}
            >
              Transfer QORT
            </Typography>
            <Button
              disabled={sendDisabled}
              variant="contained"
              startIcon={<Send />}
              aria-label="send-qort"
              onClick={sendQortRequest}
              sx={{ backgroundColor: "#05a2e4", color: "white", "&:hover": { backgroundColor: "#02648d", } }}
            >
              SEND
            </Button>
          </Toolbar>
        </AppBar>
        <div style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '20px'
        }}>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            Available Balance:&nbsp;&nbsp;
          </Typography>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {walletBalanceQort + " QORT"}
          </Typography>
        </div>
        <div style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '20px'
        }}>
          <Typography
            variant="h5"
            align="center"
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            Max Sendable:&nbsp;&nbsp;
          </Typography>
          <Typography
            variant="h5"
            align="center"
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {(walletBalanceQort - 0.01100000).toFixed(8) + " QORT"}
          </Typography>
          <div style={{ marginInlineStart: '15px' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSendMaxQort}
              style={{ borderRadius: 50 }}
            >
              Send Max
            </Button>
          </div>
        </div>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '20px',
            flexDirection: 'column',
            '& .MuiTextField-root': { width: '50ch' },
          }}
        >
          <NumericFormat
            decimalScale={8}
            defaultValue={0}
            value={qortAmount}
            allowNegative={false}
            customInput={TextField}
            valueIsNumericString
            variant="outlined"
            label="Amount (QORT)"
            isAllowed={(values) => {
              const maxQortCoin = (walletBalanceQort - 0.01100000);
              const { formattedValue, floatValue } = values;
              return formattedValue === "" || floatValue <= maxQortCoin;
            }}
            onValueChange={(values) => {
              validateCanSendQortAmount(values.floatValue);
            }}
            required
          />
          <TextField
            required
            label="Receiver Address Or Name"
            id="qort-address"
            margin="normal"
            value={qortRecipient}
            helperText="QORT address 34 characters long (Name min 3 characters) !"
            slotProps={{ htmlInput: { maxLength: 34, minLength: 3 } }}
            onChange={(e) => validateCanSendQortAddress(e.target.value)}
          />
        </Box>
        <div style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Typography
            align="center"
            sx={{ fontWeight: 600, fontSize: '14px', marginTop: '15px' }}
          >
            Current sending fee is 0.01 QORT.
          </Typography>
        </div>
      </Dialog>
    );
  }

  return (
    <Box sx={{ width: '100%', marginTop: "20px" }}>
      {QortSendDialogPage()}
      {QortQrDialogPage()}
      {QortAddressBookDialogPage()}
      <Typography gutterBottom variant="h5" sx={{ color: 'primary.main', fontStyle: 'italic', fontWeight: 700 }}>
        Qortal Wallet
      </Typography>
      <WalleteCard>
        <CoinAvatar
          src={coinLogoQORT}
          alt="Coinlogo"
        />
        <div style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography
            variant="h5"
            align="center"
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            Balance:&nbsp;&nbsp;
          </Typography>
          <Typography
            variant="h5"
            align="center"
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {walletBalanceQort ? walletBalanceQort + " QORT" : <Box sx={{ width: '175px' }}><LinearProgress /></Box>}
          </Typography>
        </div>
        <div style={{
          width: "100%",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: "10px"
        }}>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            Address:&nbsp;&nbsp;
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {userInfo?.address}
          </Typography>
          <Tooltip placement="right" title={copyQortAddress ? copyQortAddress : "Copy Address"}>
            <IconButton aria-label="copy" size="small" onClick={() => { navigator.clipboard.writeText(userInfo?.address), changeCopyQortcStatus() }}>
              <CopyAllTwoTone fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
        <div style={{
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          marginTop: '15px'
        }}>
          <WalletButtons
            variant="contained"
            startIcon={<Send style={{ marginBottom: '2px' }} />}
            aria-label="Transfer"
            onClick={handleOpenQortSend}
          >
            Transfer QORT
          </WalletButtons>
          <WalletButtons
            variant="contained"
            startIcon={<QrCode2 style={{ marginBottom: '2px' }} />}
            aria-label="QRcode"
            onClick={handleOpenQortQR}
          >
            Show QR Code
          </WalletButtons>
          <WalletButtons
            variant="contained"
            startIcon={<ImportContacts style={{ marginBottom: '2px' }} />}
            aria-label="AddressBook"
            onClick={handleOpenAddressBook}
          >
            Address Book
          </WalletButtons>
        </div>
        <div style={{
          width: "100%",
          display: 'flex',
          alignItems: 'left',
          marginTop: "15px",
          marginBottom: "15px"
        }}>
          <Button
            size="large"
            onClick={handleLoadingRefreshQort}
            loading={loadingRefreshQort}
            loadingPosition="start"
            startIcon={<Refresh style={{ marginBottom: '2px' }} />}
            variant="text"
            style={{ borderRadius: 50 }}
          >
            <span style={{ color: 'white' }}>Transactions</span>
          </Button>
        </div>
        {loadingRefreshQort ? tableLoader() : qortalTables()}
      </WalleteCard>
    </Box>
  );
}