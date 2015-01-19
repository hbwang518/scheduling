USE [HQ_XUEYUAN]
GO

/****** Object:  StoredProcedure [dbo].[SP_BeginClassUpdateTeacher]    Script Date: 2015/1/6 16:52:43 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE procedure [dbo].[SP_BeginClassUpdateTeacher]
@BeginClassSN varchar(20),
@TeacherSN varchar(20),
@Course NVarChar(20),
@TCGoldSN varchar(20),
@UserSN varchar(20)
AS

--MUYU���ӿ�ʼ��2010-11-11��
If Not Exists(Select * From TeacherCourseGold Where TCGoldSN = @TCGoldSN And TeacherSN = @TeacherSN)
Begin
	Return 0 --�α겻����
End
declare @StartTime int,@EndTime int,@Day date, @ClassRoomSN varchar(20), @settlementState nvarchar(50) = 'BSSE003'
Select @Day = [Day],@StartTime = StartTime, @EndTime=[EndTime],@ClassRoomSN=isnull(ClassRoomSN,'') From BeginClass Where BeginClassSN=@BeginClassSN
--���ж��Ƿ��ܸ���

if '' = @ClassRoomSN
begin
    set @settlementState = 'BSSE002'
end
if exists(
	select 1 from BeginClass a inner join Teacher b on a.TeacherSN=b.TeacherSN where a.TeacherSN=@TeacherSN and datediff(day,[Day],@Day)=0 And a.Del=0  and a.State<>-1 and SettlementState >= 'BSSE003' and b.del=0 and BeginClassSN<>@BeginClassSN and ((@StartTime <= StartTime And @EndTime > StartTime) Or (@StartTime >= StartTime And @StartTime < EndTime))
)
begin
	return 6	--��ʦʱ�䰲������
end
begin
	update BeginClass set Course=@Course,TeacherSN=@TeacherSN,SettlementState=@settlementState,TCGoldSN=@TCGoldSN where BeginClassSN=@BeginClassSN
	insert into BeginClassState(BeginClassSN,SettlementState,CreateTime,CreateUserSN) values(@BeginClassSN,@settlementState,getdate(),@UserSN)
end
return 3

GO


