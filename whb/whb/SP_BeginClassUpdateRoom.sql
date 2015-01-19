USE [HQ_XUEYUAN]
GO

/****** Object:  StoredProcedure [dbo].[SP_BeginClassUpdateRoom]    Script Date: 2015/1/6 16:52:35 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE procedure [dbo].[SP_BeginClassUpdateRoom]
@BeginClassSN varchar(20),
@ClassroomSN varchar(20),
@UserSN varchar(20)
AS

declare @StartTime int,@EndTime int,@Day date, @TeacherSN varchar(20), @settlementState nvarchar(50) = 'BSSE003'
Select @Day = [Day],@StartTime = StartTime, @EndTime=[EndTime],@TeacherSN=isnull(TeacherSN,'') From BeginClass Where BeginClassSN=@BeginClassSN

if '' = @TeacherSN
begin
    set @settlementState = 'BSSE002'
end

if exists(
	select 1 from BeginClass a inner join ClassRoom b on a.ClassRoomSN=b.ClassRoomSN where a.ClassROOMSN=@ClassroomSN and datediff(day,[Day],@Day)=0 And a.Del=0  and a.State<>-1 and SettlementState >= 'BSSE003' and b.del=0 and BeginClassSN<>@BeginClassSN and ((@StartTime <= StartTime And @EndTime > StartTime) Or (@StartTime >= StartTime And @StartTime < EndTime))
)
begin
	return 8	--教室时间安排相重
end

begin
	update BeginClass set ClassRoomSN=@ClassRoomSN,SettlementState=@settlementState where BeginClassSN=@BeginClassSN
	insert into BeginClassState(BeginClassSN,SettlementState,CreateTime,CreateUserSN) values(@BeginClassSN,@settlementState,getdate(),@UserSN)
end
return 3


GO


