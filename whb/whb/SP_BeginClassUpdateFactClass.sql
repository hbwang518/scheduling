USE [HQ_XUEYUAN]
GO

/****** Object:  StoredProcedure [dbo].[SP_BeginClassUpdateFactClass]    Script Date: 2015/1/6 16:52:26 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE procedure [dbo].[SP_BeginClassUpdateFactClass]
@BeginClassSN varchar(20),
@FactClassSN varchar(20),
@UserSN varchar(20)
AS

declare @totalTime float, @CurrentDurationTime float, @DeductionCTime Decimal(18,2), @StartTime int,@EndTime int,@Day date, @SettlementState varchar(50)
Select @DeductionCTime= @DeductionCTime, @settlementState = settlementState, @Day = [Day],@StartTime = StartTime, @EndTime=[EndTime] From BeginClass Where BeginClassSN=@BeginClassSN

--validate duration time
select @totalTime=FCTime  from FactClass where FactClassSN = @FactClassSN
select @CurrentDurationTime = sum(DeductionCTime) from BeginClass where FactClassSN = @FactClassSN and DEL=0 and State<>-1

if(@CurrentDurationTime + @DeductionCTime > @totalTime) 
    return 3

if exists(select 1 from BeginClass where FactClassSN=@FactClassSN and datediff(day,[Day],@Day)=0 And Del=0 and State<>-1 and ((@StartTime <= StartTime And @EndTime > StartTime) Or (@StartTime >= StartTime And @StartTime < EndTime)))
    return 5	--物理班时间安排相重

begin
	update BeginClass set FactClassSN=@FactClassSN where BeginClassSN=@BeginClassSN
	insert into BeginClassState(BeginClassSN,SettlementState,CreateTime,CreateUserSN) values(@BeginClassSN,@settlementState,getdate(),@UserSN)
end
return 1



GO


